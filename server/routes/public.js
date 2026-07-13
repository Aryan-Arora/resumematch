import { Router } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import { getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { classifyDomain, getDomainList } from "../services/domainClassify.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";
import { parsePdf, parseDocx } from "../services/parsing.js";
import { findImpliedSkills, KEYPHRASE_MATCH_THRESHOLD } from "../services/semanticSkillMatch.js";
import { computeFinalScore } from "../services/scoring.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(
  readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8")
);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_DEMO_RESUMES = 3;

const router = Router();

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
});

async function classifyJobDescription(description) {
  const jdEmbedding = await getEmbedding(description);
  const candidateDomain = await classifyDomain(jdEmbedding);
  const candidateSkills = extractSkills(description, taxonomy[candidateDomain]);

  let domain;
  let skills;
  if (candidateSkills.length === 0) {
    domain = "general";
    skills = extractKeyphrases(description, { minWordsPerPhrase: 2 });
  } else {
    domain = candidateDomain;
    skills = candidateSkills;
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

  if (parsed.unparseable) {
    return { file_name: fileName, unparseable: true };
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
    const { domain, skills } = await classifyJobDescription(description);
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
    const { jdEmbedding, domain, skills } = await classifyJobDescription(description);

    const skillEmbeddingCache = new Map();
    const files = req.files || [];
    const candidates = [];
    for (const file of files) {
      candidates.push(
        await scoreResumeBuffer(file.buffer, file.originalname, jdEmbedding, domain, skills, skillEmbeddingCache)
      );
    }

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
