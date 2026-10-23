import { Router } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import { EMBEDDING_MODEL_VERSION, getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, extractSkillsWithSemanticFallback, compareSkills } from "../services/skillMatch.js";
import { classifyDomain, getDomainList } from "../services/domainClassify.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";
import { parsePdf, parseDocx } from "../services/parsing.js";
import { ocrResume, shouldUseOcr } from "../services/ocr.js";
import { findImpliedSkills, KEYPHRASE_MATCH_THRESHOLD, getSharedSkillEmbeddingCache } from "../services/semanticSkillMatch.js";
import { computeFinalScore } from "../services/scoring.js";
import { supabase } from "../supabaseClient.js";
import { hasExpectedFileSignature } from "../services/fileValidation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(
  readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8")
);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_DEMO_RESUMES = 3;

const router = Router();

// Anonymous usage counter for the public demo: no JD text, resumes or IPs are
// stored. Fire-and-forget so a missing table or DB blip never fails a demo run.
function logDemoEvent(event, domain, resumeCount) {
  supabase
    .from("demo_events")
    .insert({ event, domain, resume_count: resumeCount })
    .then(({ error }) => {
      if (error) console.warn("demo_events insert failed:", error.message);
    });
}

// Unauthenticated and runs an embedding model — the one route in this app
// with no logged-in user behind it to hold accountable, so it's the one
// that most needs its own rate limit rather than relying on general auth.
const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this address — please try again in a few minutes." },
});

const publicUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_DEMO_RESUMES },
  fileFilter(req, file, cb) {
    const ext = extname(file.originalname).toLowerCase();
    if (![".pdf", ".docx"].includes(ext)) {
      const error = new Error("Only .pdf and .docx resumes are accepted.");
      error.status = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

async function classifyJobDescription(description, skillEmbeddingCache) {
  const jdEmbedding = await getEmbedding(description);
  const candidateDomain = await classifyDomain(jdEmbedding);
  // Literal-only check decides whether this domain fits at all — a terse JD
  // that just barely fits should still fall back to "general" if literally
  // nothing in the taxonomy is present. The semantic fallback only kicks in
  // once a domain is already chosen, to fill in requirements phrased
  // differently than the taxonomy's exact wording.
  const literalCandidateSkills = extractSkills(description, taxonomy[candidateDomain]);

  let domain;
  let skills;
  if (literalCandidateSkills.length === 0) {
    domain = "general";
    skills = extractKeyphrases(description, { minWordsPerPhrase: 2 });
  } else {
    domain = candidateDomain;
    skills = await extractSkillsWithSemanticFallback(description, taxonomy[domain], skillEmbeddingCache);
  }
  return { jdEmbedding, domain, skills };
}

// Scores one resume buffer against a JD in memory only — nothing is written
// to storage or the database. This is the public demo's whole point: prove
// the matching engine works before anyone hands over real candidate data.
async function scoreResumeBuffer(buffer, fileName, jdEmbedding, domain, jdSkills, skillEmbeddingCache) {
  const ext = extname(fileName).toLowerCase();
  let parsed;
  if (ext === ".pdf") parsed = await parsePdf(buffer);
  else if (ext === ".docx") parsed = await parseDocx(buffer);
  else parsed = { text: "", unparseable: true };

  if (shouldUseOcr(parsed)) {
    const ocr = await ocrResume(buffer, { fileName });
    if (ocr.available && ocr.text) {
      parsed = {
        ...ocr,
        unparseable: false,
        needsOcr: true,
        warnings: [...new Set([...(parsed.warnings || []), ...(ocr.warnings || [])])],
      };
    } else {
      parsed = { ...parsed, warnings: [...new Set([...(parsed.warnings || []), ...(ocr.warnings || [])])], needsOcr: true };
    }
  }

  if (parsed.unparseable) {
    return {
      file_name: fileName,
      unparseable: true,
      parse_method: parsed.method,
      parse_confidence: parsed.confidence,
      parse_warnings: parsed.warnings || [],
      model_version: EMBEDDING_MODEL_VERSION,
    };
  }

  const domainSkillSet = domain === "general" ? { keyphrases: jdSkills } : taxonomy[domain] || taxonomy.tech;

  const resumeEmbedding = await getEmbedding(parsed.text);
  const semanticScore = cosineSimilarity(jdEmbedding, resumeEmbedding);
  const resumeSkills = extractSkills(parsed.text, domainSkillSet);
  const { matched, missing } = compareSkills(jdSkills, resumeSkills);
  const { impliedSkills, evidence } = await findImpliedSkills(missing, parsed.text, skillEmbeddingCache, {
    threshold: domain === "general" ? KEYPHRASE_MATCH_THRESHOLD : undefined,
  });
  const stillMissing = missing.filter((s) => !impliedSkills.includes(s));
  const skillScore = jdSkills.length > 0 ? (matched.length + impliedSkills.length) / jdSkills.length : 0;
  const finalScore = computeFinalScore(semanticScore, skillScore);

  return {
    file_name: fileName,
    unparseable: false,
    parse_method: parsed.method,
    parse_confidence: parsed.confidence,
    parse_warnings: parsed.warnings || [],
    model_version: EMBEDDING_MODEL_VERSION,
    matched_skills: matched,
    missing_skills: stillMissing,
    implied_skills: impliedSkills,
    implied_skill_evidence: evidence,
    semantic_score: semanticScore,
    skill_score: skillScore,
    final_score: finalScore,
  };
}

router.post("/public/classify", demoLimiter, async (req, res) => {
  const { description } = req.body || {};
  if (!description || description.trim().length < 20) {
    return res
      .status(400)
      .json({ error: "Paste a fuller job description (at least a couple of sentences)." });
  }
  if (description.length > 5000) {
    return res.status(400).json({ error: "That's too long — please paste under 5,000 characters." });
  }

  try {
    const { domain, skills } = await classifyJobDescription(description, getSharedSkillEmbeddingCache());
    logDemoEvent("classify", domain, 0);
    res.json({ domain, skills, curatedDomains: getDomainList().filter((d) => d !== "general") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong processing that description." });
  }
});

router.post("/public/match", demoLimiter, (req, res, next) => {
  publicUpload.array("resumes", MAX_DEMO_RESUMES)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          error: `The free demo scores up to ${MAX_DEMO_RESUMES} resumes at a time — sign up (free) to screen more.`,
        });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "One or more files exceed the 10MB size limit." });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  const { description } = req.body || {};
  if (!description || description.trim().length < 20) {
    return res
      .status(400)
      .json({ error: "Paste a fuller job description (at least a couple of sentences)." });
  }
  if (description.length > 5000) {
    return res.status(400).json({ error: "That's too long — please paste under 5,000 characters." });
  }

  try {
    // Shared across JD-side requirement extraction and every resume scored
    // below, and persisted across requests (see getSharedSkillEmbeddingCache)
    // — a taxonomy skill's embedding is the same phrase every time, no matter
    // which request or which side of the match it's being checked against.
    const skillEmbeddingCache = getSharedSkillEmbeddingCache();
    const { jdEmbedding, domain, skills } = await classifyJobDescription(description, skillEmbeddingCache);

    const files = req.files || [];
    const candidates = [];
    for (const file of files) {
      const ext = extname(file.originalname).toLowerCase();
      if (!hasExpectedFileSignature(file.buffer, ext)) {
        return res.status(400).json({
          error: `${file.originalname}: ${ext === ".pdf" ? "file is not a valid PDF" : "file is not a valid DOCX document"}.`,
        });
      }
      candidates.push(
        await scoreResumeBuffer(file.buffer, file.originalname, jdEmbedding, domain, skills, skillEmbeddingCache)
      );
    }

    logDemoEvent("match", domain, candidates.length);
    res.json({
      domain,
      skills,
      curatedDomains: getDomainList().filter((d) => d !== "general"),
      candidates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong processing that request." });
  }
});

export default router;
