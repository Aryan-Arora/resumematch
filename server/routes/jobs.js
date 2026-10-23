import { Router } from "express";
import multer from "multer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import { supabase } from "../supabaseClient.js";
import { parsePdf, parseDocx, extractEmail, extractContactDetails } from "../services/parsing.js";
import { EMBEDDING_MODEL_VERSION, getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, extractSkillsWithSemanticFallback, compareSkills } from "../services/skillMatch.js";
import { findImpliedSkills, KEYPHRASE_MATCH_THRESHOLD, getSharedSkillEmbeddingCache } from "../services/semanticSkillMatch.js";
import { computeFinalScore } from "../services/scoring.js";
import { classifyDomain, getDomainList } from "../services/domainClassify.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";
import { enqueue, getQueueDepth, MAX_PENDING_TASKS } from "../services/uploadQueue.js";
import { generateComplianceNoticeHtml } from "../services/complianceNotice.js";
import { extractRequiredFilters, evaluateEligibility } from "../services/eligibility.js";
import { ocrResume, shouldUseOcr } from "../services/ocr.js";
import { hasExpectedFileSignature } from "../services/fileValidation.js";
import { jobWriteLimiter, uploadLimiter, orgActionLimiter } from "../middleware/rateLimit.js";
import { parseCsv } from "../services/csv.js";
import { normalizeImportRows } from "../services/candidateImport.js";
import { dispatchWebhook } from "../services/webhooks.js";
import { fetchGreenhouseCandidates } from "../services/greenhouse.js";
import { fetchLeverOpportunities } from "../services/lever.js";
import { fetchWorkableCandidates } from "../services/workable.js";
import { downloadProviderResume } from "../services/providerResume.js";

function domainTaxonomy(job) {
  return job.jd_domain === "general"
    ? { keyphrases: job.jd_skills }
    : taxonomy[job.jd_domain] || taxonomy.tech;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(
  readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8")
);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES_PER_UPLOAD = 100;
const ALLOWED_RESUME_EXTENSIONS = new Set([".pdf", ".docx"]);
const ALLOWED_RESUME_CONTENT_TYPES = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Only .pdf/.docx get past this — without it, any file type (including
// HTML/SVG) could be uploaded to Storage and later served back via a signed
// URL with an attacker-controlled Content-Type, which is a stored-content
// risk once opened in a browser tab.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES_PER_UPLOAD,
  },
  fileFilter(req, file, cb) {
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_RESUME_EXTENSIONS.has(ext)) {
      const err = new Error("Only .pdf and .docx resumes are accepted.");
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES_PER_UPLOAD + 1 },
  fileFilter(req, file, cb) {
    if (file.fieldname === "csv" && !/\.csv$/i.test(file.originalname)) return cb(Object.assign(new Error("Only .csv files are accepted for the csv field."), { status: 400 }));
    if (file.fieldname === "resumes" && !ALLOWED_RESUME_EXTENSIONS.has(extname(file.originalname).toLowerCase())) return cb(Object.assign(new Error("Only .pdf and .docx resumes are accepted."), { status: 400 }));
    cb(null, true);
  },
});
const router = Router();

router.get("/jobs", async (req, res) => {
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, description, jd_skills, jd_domain, created_at, interview_url, email_templates")
    .eq("org_id", req.orgId)
    .order("created_at", { ascending: false });
  if (jobsError) return res.status(500).json({ error: jobsError.message });

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("job_id, final_score, unparseable")
    .eq("org_id", req.orgId);
  if (candidatesError) return res.status(500).json({ error: candidatesError.message });

  const statsByJob = new Map();
  for (const c of candidates) {
    const stats = statsByJob.get(c.job_id) || { count: 0, scoreSum: 0, scoreCount: 0 };
    stats.count += 1;
    if (!c.unparseable && c.final_score !== null) {
      stats.scoreSum += Number(c.final_score);
      stats.scoreCount += 1;
    }
    statsByJob.set(c.job_id, stats);
  }

  const result = jobs.map((job) => {
    const stats = statsByJob.get(job.id) || { count: 0, scoreSum: 0, scoreCount: 0 };
    return {
      ...job,
      candidate_count: stats.count,
      avg_score: stats.scoreCount > 0 ? stats.scoreSum / stats.scoreCount : null,
    };
  });

  res.json(result);
});

router.patch("/jobs/:id/settings", jobWriteLimiter, async (req, res) => {
  const templates = req.body.email_templates && typeof req.body.email_templates === "object" ? req.body.email_templates : null;
  const interviewUrl = typeof req.body.interview_url === "string" ? req.body.interview_url.trim() : undefined;
  if (!templates && interviewUrl === undefined) return res.status(400).json({ error: "job settings are required" });
  if (interviewUrl && !/^https:\/\//i.test(interviewUrl)) return res.status(400).json({ error: "Interview link must use https://" });
  const update = {};
  if (interviewUrl !== undefined) update.interview_url = interviewUrl;
  if (templates) update.email_templates = {
    shortlist: typeof templates.shortlist === "string" ? templates.shortlist.slice(0, 5000) : "",
    interview: typeof templates.interview === "string" ? templates.interview.slice(0, 5000) : "",
    rejection: typeof templates.rejection === "string" ? templates.rejection.slice(0, 5000) : "",
  };
  const { data, error } = await supabase.from("jobs").update(update).eq("id", req.params.id).eq("org_id", req.orgId).select("id, interview_url, email_templates").single();
  if (error || !data) return res.status(404).json({ error: "job not found" });
  res.json(data);
});

router.get("/jobs/domains", (req, res) => {
  res.json(getDomainList());
});

router.post("/jobs", jobWriteLimiter, async (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const domain = typeof req.body.domain === "string" ? req.body.domain.trim() : "";
  const interviewUrl = typeof req.body.interview_url === "string" ? req.body.interview_url.trim() : "";
  const requirementConfig = req.body.requirement_config && typeof req.body.requirement_config === "object" ? req.body.requirement_config : {};
  const emailTemplates = req.body.email_templates && typeof req.body.email_templates === "object" ? req.body.email_templates : {};
  if (!title || !description) {
    return res.status(400).json({ error: "title and description are required" });
  }
  if (title.length > 200) {
    return res.status(400).json({ error: "Title is too long (max 200 characters)." });
  }
  if (description.length > 5000) {
    return res.status(400).json({ error: "Description is too long (max 5,000 characters)." });
  }
  if (interviewUrl && !/^https:\/\//i.test(interviewUrl)) return res.status(400).json({ error: "Interview link must use https://" });

  const jdEmbedding = await getEmbedding(description);
  const skillEmbeddingCache = getSharedSkillEmbeddingCache();

  let jdDomain;
  let jdSkills;
  if (domain === "general") {
    jdDomain = "general";
    jdSkills = extractKeyphrases(description, { minWordsPerPhrase: 2 });
  } else if (domain && taxonomy[domain]) {
    jdDomain = domain;
    jdSkills = await extractSkillsWithSemanticFallback(description, taxonomy[jdDomain], skillEmbeddingCache);
  } else {
    // Auto-classify, then verify the chosen domain's taxonomy actually finds
    // anything in the JD — embedding similarity alone isn't reliable enough
    // at the margin (a terse tech JD can score lower than an unrelated JD).
    // Zero literal matches means the domain doesn't fit; fall back to
    // extracting the JD's own keyphrases instead of forcing a bad taxonomy.
    // (Literal-only check here on purpose — semantic fallback only kicks in
    // once a domain is confirmed to fit at all.)
    const candidateDomain = await classifyDomain(jdEmbedding);
    const literalCandidateSkills = extractSkills(description, taxonomy[candidateDomain]);
    if (literalCandidateSkills.length === 0) {
      jdDomain = "general";
      jdSkills = extractKeyphrases(description, { minWordsPerPhrase: 2 });
    } else {
      jdDomain = candidateDomain;
      jdSkills = await extractSkillsWithSemanticFallback(description, taxonomy[jdDomain], skillEmbeddingCache);
    }
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title,
      description,
      jd_embedding: jdEmbedding,
      jd_skills: jdSkills,
      jd_domain: jdDomain,
      required_filters: extractRequiredFilters(description),
      interview_url: interviewUrl,
      email_templates: {
        shortlist: typeof emailTemplates.shortlist === "string" ? emailTemplates.shortlist.slice(0, 5000) : "",
        interview: typeof emailTemplates.interview === "string" ? emailTemplates.interview.slice(0, 5000) : "",
        rejection: typeof emailTemplates.rejection === "string" ? emailTemplates.rejection.slice(0, 5000) : "",
      },
      requirement_config: {
        must_have: Array.isArray(requirementConfig.must_have) ? requirementConfig.must_have.slice(0, 30) : [],
        preferred: Array.isArray(requirementConfig.preferred) ? requirementConfig.preferred.slice(0, 30) : [],
        disqualifiers: Array.isArray(requirementConfig.disqualifiers) ? requirementConfig.disqualifiers.slice(0, 30) : [],
      },
      org_id: req.orgId,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

async function downloadFromStorage(storagePath) {
  const { data, error } = await supabase.storage.from("resumes").download(storagePath);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

// Takes a storage path, not a raw file buffer — the file is uploaded to
// storage *before* this is ever queued (see the upload route below), so a
// server restart mid-processing can always re-download and retry instead of
// losing the resume along with the in-memory request that received it.
export async function processCandidate(job, candidateId, storagePath, fileName, skillEmbeddingCache) {
  try {
    const { data: attemptRow, error: attemptReadError } = await supabase.from("candidates").select("parse_attempts").eq("id", candidateId).eq("org_id", job.org_id).single();
    if (attemptReadError || !attemptRow) throw new Error("candidate no longer exists");
    const parseAttempts = Number(attemptRow.parse_attempts || 0) + 1;
    const { error: attemptUpdateError } = await supabase.from("candidates").update({ parse_attempts: parseAttempts }).eq("id", candidateId).eq("org_id", job.org_id);
    if (attemptUpdateError) throw attemptUpdateError;
    const ext = extname(fileName).toLowerCase();
    const buffer = await downloadFromStorage(storagePath);
    let parsed;
    if (ext === ".pdf") {
      parsed = await parsePdf(buffer);
    } else if (ext === ".docx") {
      parsed = await parseDocx(buffer);
    } else {
      parsed = { text: "", unparseable: true };
    }

    if (shouldUseOcr(parsed)) {
      const ocr = await ocrResume(buffer, { fileName });
      const warnings = [...new Set([...(parsed.warnings || []), ...(ocr.warnings || [])])];
      if (ocr.available && ocr.text) parsed = { ...ocr, unparseable: false, needsOcr: true, warnings };
      else parsed = { ...parsed, warnings, needsOcr: true };
    }

    if (parsed.unparseable) {
      const { error } = await supabase
        .from("candidates")
        .update({ unparseable: true, status: "done", parse_method: parsed.method, parse_confidence: parsed.confidence, parse_warnings: parsed.warnings, eligibility_status: "needs_review", eligibility_reasons: [{ type: "unclear", text: "Resume could not be read reliably." }] })
        .eq("id", candidateId);
      if (error) throw error;
      return;
    }

    const resumeEmbedding = await getEmbedding(parsed.text);
    const semanticScore = cosineSimilarity(job.jd_embedding, resumeEmbedding);

    const resumeSkills = extractSkills(parsed.text, domainTaxonomy(job));
    const { matched, missing } = compareSkills(job.jd_skills, resumeSkills);

    const { impliedSkills, evidence } = await findImpliedSkills(
      missing,
      parsed.text,
      skillEmbeddingCache,
      { threshold: job.jd_domain === "general" ? KEYPHRASE_MATCH_THRESHOLD : undefined }
    );
    const stillMissing = missing.filter((s) => !impliedSkills.includes(s));

    const skillScore =
      job.jd_skills.length > 0
        ? (matched.length + impliedSkills.length) / job.jd_skills.length
        : 0;
    const finalScore = computeFinalScore(semanticScore, skillScore);
    const eligibility = evaluateEligibility({ ...job.required_filters, ...(job.requirement_config || {}) }, parsed.text);
    const contact = extractContactDetails(parsed.text);
    const extractedEmail = extractEmail(parsed.text);
    let parseWarnings = [...(parsed.warnings || [])];
    if (extractedEmail) {
      const { data: duplicate } = await supabase
        .from("candidates")
        .select("id, file_name")
        .eq("org_id", job.org_id)
        .eq("job_id", job.id)
        .eq("email", extractedEmail)
        .neq("id", candidateId)
        .limit(1)
        .maybeSingle();
      if (duplicate) parseWarnings.push(`Possible duplicate of ${duplicate.file_name || "another candidate"}; verify before contacting.`);
    }

    const { error } = await supabase
      .from("candidates")
      .update({
        resume_text: parsed.text,
        email: extractedEmail,
        phone: contact.phone,
        linkedin_url: contact.linkedinUrl,
        portfolio_url: contact.portfolioUrl,
        resume_embedding: resumeEmbedding,
        matched_skills: matched,
        missing_skills: stillMissing,
        implied_skills: impliedSkills,
        implied_skill_evidence: evidence,
        semantic_score: semanticScore,
        skill_score: skillScore,
        final_score: finalScore,
        unparseable: false,
        parse_method: parsed.method,
        parse_confidence: parsed.confidence,
        parse_warnings: parseWarnings,
        model_version: EMBEDDING_MODEL_VERSION,
        eligibility_status: eligibility.status,
        eligibility_reasons: eligibility.reasons,
        review_status: "needs_review",
        status: "done",
      })
      .eq("id", candidateId);

    if (error) throw error;
  } catch (err) {
    await supabase
      .from("candidates")
      .update({ status: "failed", error_message: err.message || String(err) })
      .eq("id", candidateId);
  }
}

// Storage, OCR, embeddings, and the database can fail transiently. Retry a
// bounded number of times so a temporary outage does not strand a candidate;
// malformed files still end in `failed` after the limit and remain manually
// reprocessable from the recruiter workspace.
async function processCandidateWithRetry(job, candidateId, storagePath, fileName, skillEmbeddingCache) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await processCandidate(job, candidateId, storagePath, fileName, skillEmbeddingCache);
    const { data } = await supabase.from("candidates").select("status").eq("id", candidateId).eq("org_id", job.org_id).maybeSingle();
    if (!data || data.status === "done" || attempt === maxAttempts) return data;
    await supabase.from("candidates").update({ status: "queued", error_message: null }).eq("id", candidateId).eq("org_id", job.org_id);
    await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** (attempt - 1))));
  }
  return null;
}

async function notifyCandidateScreened(job, candidateId, fileName) {
  const { data } = await supabase.from("candidates").select("status, final_score, unparseable, eligibility_status").eq("id", candidateId).eq("org_id", job.org_id).maybeSingle();
  if (!data || data.status !== "done") return;
  void dispatchWebhook(job.org_id, "candidate.screened", { candidate_id: candidateId, job_id: job.id, file_name: fileName, status: data.status, final_score: data.final_score, unparseable: data.unparseable, eligibility_status: data.eligibility_status });
}

router.post("/jobs/:id/candidates", uploadLimiter, upload.array("resumes"), async (req, res) => {
  const jobId = req.params.id;
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "at least one resume file is required" });
  }
  if (getQueueDepth() + files.length > MAX_PENDING_TASKS) {
    return res.status(429).json({
      error: "Resume processing is busy right now. Please wait for the current queue to clear and try again.",
      queue_depth: getQueueDepth(),
    });
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("org_id", req.orgId)
    .single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });

  // Upload every file to storage synchronously (fast — this is I/O, not the
  // slow part) before creating its candidate row, so the resume bytes are
  // durable from the moment a row exists. Parsing/embedding is what's queued
  // in the background, not the upload — a crash mid-processing can always
  // re-download from storage and retry (see the recovery sweep in index.js),
  // instead of losing the file along with the in-memory request that received it.
  const queued = [];
  const failures = [];
  for (const file of files) {
    const ext = extname(file.originalname).toLowerCase();
    if (!hasExpectedFileSignature(file.buffer, ext)) {
      failures.push({
        file_name: file.originalname,
        error: ext === ".pdf" ? "File is not a valid PDF." : "File is not a valid DOCX document.",
      });
      continue;
    }
    // The storage key only ever contains a sanitized basename — never the
    // raw, attacker-controlled original filename — so nothing in it can
    // affect the object's path. Content-Type comes from the verified
    // extension, not the client-supplied (and equally spoofable) mimetype.
    const safeBasename = file.originalname
      .replace(/[/\\]/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(-100);
    const storagePath = `${jobId}/${Date.now()}-${safeBasename}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, file.buffer, { contentType: ALLOWED_RESUME_CONTENT_TYPES[ext] });
    if (uploadError) {
      failures.push({ file_name: file.originalname, error: uploadError.message });
      continue;
    }

    const { data, error } = await supabase
      .from("candidates")
      .insert({
        job_id: jobId,
        file_name: file.originalname,
        file_path: storagePath,
        status: "queued",
        org_id: req.orgId,
      })
      .select()
      .single();
    if (error) {
      await supabase.storage.from("resumes").remove([storagePath]);
      failures.push({ file_name: file.originalname, error: error.message });
      continue;
    }
    queued.push(data);
  }

  res.status(202).json({ candidates: queued, failures });

  const skillEmbeddingCache = getSharedSkillEmbeddingCache();
  for (const candidate of queued) {
    enqueue(async () => {
      await processCandidateWithRetry(job, candidate.id, candidate.file_path, candidate.file_name, skillEmbeddingCache);
      await notifyCandidateScreened(job, candidate.id, candidate.file_name);
    });
  }
});

// Import recruiter metadata from an ATS export. Imported rows intentionally do
// not receive an AI score: a resume file is required before screening begins.
router.post("/jobs/:id/candidates/import", uploadLimiter, csvUpload.fields([{ name: "csv", maxCount: 1 }, { name: "resumes", maxCount: MAX_FILES_PER_UPLOAD }]), async (req, res) => {
  const csvFile = req.files?.csv?.[0];
  const resumeFiles = req.files?.resumes || [];
  if (!csvFile) return res.status(400).json({ error: "a CSV file is required" });
  if (csvFile.size > 2 * 1024 * 1024) return res.status(400).json({ error: "CSV files must be 2MB or smaller" });
  let rows;
  try {
    rows = parseCsv(csvFile.buffer.toString("utf8"));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  const { imported, failures } = normalizeImportRows(rows);
  if (imported.length === 0) return res.status(400).json({ error: "no valid candidate rows found", failures });
  const { data: job, error: jobError } = await supabase.from("jobs").select("id").eq("id", req.params.id).eq("org_id", req.orgId).single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });
  const emails = imported.map((row) => row.email).filter(Boolean);
  const { data: existing, error: existingError } = emails.length
    ? await supabase.from("candidates").select("email").eq("job_id", job.id).eq("org_id", req.orgId).in("email", emails)
    : { data: [], error: null };
  if (existingError) return res.status(500).json({ error: existingError.message });
  const existingEmails = new Set((existing || []).map((row) => row.email));
  const fresh = imported.filter((row) => {
    if (!row.email || !existingEmails.has(row.email)) return true;
    failures.push({ row: row.rowNumber, error: "email already exists for this job" });
    return false;
  });
  if (fresh.length === 0) return res.status(409).json({ error: "all valid rows already exist for this job", failures });
  if (resumeFiles.length > 0 && getQueueDepth() + resumeFiles.length > MAX_PENDING_TASKS) {
    return res.status(429).json({ error: "Resume processing is busy right now. Please wait and retry the import.", queue_depth: getQueueDepth() });
  }
  const resumeByName = new Map(resumeFiles.map((file) => [file.originalname, file]));
  const queuedRows = [];
  const candidateRows = [];
  for (const row of fresh) {
    const file = resumeByName.get(row.file_name);
    if (!file) {
      candidateRows.push({
        job_id: job.id, org_id: req.orgId, file_name: row.file_name, file_path: null,
        email: row.email, phone: row.phone, linkedin_url: row.linkedin_url, portfolio_url: row.portfolio_url,
        recruiter_notes: row.recruiter_notes, status: "imported", unparseable: true, parse_method: "manual",
        parse_warnings: ["Imported from ATS metadata; upload a PDF or DOCX before screening."], review_status: "needs_review",
      });
      continue;
    }
    const ext = extname(file.originalname).toLowerCase();
    if (!hasExpectedFileSignature(file.buffer, ext)) {
      failures.push({ row: row.rowNumber, error: `resume file ${file.originalname} is not a valid ${ext === ".pdf" ? "PDF" : "DOCX"}` });
      continue;
    }
    const safeBasename = file.originalname.replace(/[/\\]/g, "_").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const storagePath = `${job.id}/${Date.now()}-${safeBasename}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(storagePath, file.buffer, { contentType: ALLOWED_RESUME_CONTENT_TYPES[ext] });
    if (uploadError) {
      failures.push({ row: row.rowNumber, error: uploadError.message });
      continue;
    }
    queuedRows.push({ job_id: job.id, org_id: req.orgId, file_name: file.originalname, file_path: storagePath, email: row.email, phone: row.phone, linkedin_url: row.linkedin_url, portfolio_url: row.portfolio_url, recruiter_notes: row.recruiter_notes, status: "queued", review_status: "needs_review" });
  }
  candidateRows.push(...queuedRows);
  if (candidateRows.length === 0) return res.status(400).json({ error: "no importable candidate rows found", failures });
  const { data: candidates, error: insertError } = await supabase.from("candidates").insert(candidateRows).select("id, job_id, file_name, file_path, email, status, unparseable, parse_method, created_at");
  if (insertError) {
    const uploadedPaths = queuedRows.map((row) => row.file_path).filter(Boolean);
    if (uploadedPaths.length) await supabase.storage.from("resumes").remove(uploadedPaths);
    return res.status(500).json({ error: insertError.message });
  }
  const candidateIds = (candidates || []).map((candidate) => candidate.id);
  await Promise.all([
    supabase.from("candidate_activity").insert(candidateIds.map((candidate_id) => ({ candidate_id, org_id: req.orgId, actor_id: req.userId || null, event_type: "candidate_imported", event_data: { source: queuedRows.length ? "csv_metadata_and_resumes" : "csv_metadata" } }))),
    supabase.from("organization_audit_events").insert(candidateIds.map((candidate_id) => ({ candidate_id, org_id: req.orgId, actor_id: req.userId || null, event_type: "candidate_imported", event_data: { source: queuedRows.length ? "csv_metadata_and_resumes" : "csv_metadata" } }))),
  ]);
  res.status(201).json({ candidates, imported: candidates?.length || 0, queued: queuedRows.length, failures });
  const skillEmbeddingCache = getSharedSkillEmbeddingCache();
  for (const candidate of (candidates || []).filter((candidate) => candidate.status === "queued")) {
    enqueue(async () => {
      await processCandidateWithRetry(job, candidate.id, candidate.file_path, candidate.file_name, skillEmbeddingCache);
      await notifyCandidateScreened(job, candidate.id, candidate.file_name);
    });
  }
});

// Import Greenhouse metadata without storing the provider API key. Resumes
// still need to be uploaded separately (or through the CSV+resume flow) before
// a candidate can be screened.
router.post("/jobs/:id/integrations/greenhouse/candidates/import", uploadLimiter, async (req, res) => {
  const apiKey = req.body?.api_key;
  const greenhouseJobId = req.body?.greenhouse_job_id;
  if (typeof apiKey !== "string" || typeof greenhouseJobId !== "string") return res.status(400).json({ error: "api_key and greenhouse_job_id are required" });
  const { data: job, error: jobError } = await supabase.from("jobs").select("id").eq("id", req.params.id).eq("org_id", req.orgId).single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });
  let rows;
  try { rows = await fetchGreenhouseCandidates(apiKey, greenhouseJobId); }
  catch (error) { return res.status(502).json({ error: error.message }); }
  if (!rows.length) return res.status(200).json({ imported: 0, candidates: [], failures: [] });
  const emails = rows.map((row) => row.email).filter(Boolean).map((email) => email.toLowerCase());
  const { data: existing, error: existingError } = emails.length ? await supabase.from("candidates").select("email").eq("job_id", job.id).eq("org_id", req.orgId).in("email", emails) : { data: [], error: null };
  if (existingError) return res.status(500).json({ error: existingError.message });
  const existingEmails = new Set((existing || []).map((row) => row.email));
  const fresh = rows.filter((row) => !row.email || !existingEmails.has(row.email.toLowerCase()));
  const failures = rows.length - fresh.length;
  const candidateRows = fresh.map((row) => ({ job_id: job.id, org_id: req.orgId, file_name: row.file_name, email: row.email || null, phone: row.phone || null, linkedin_url: row.linkedin_url || null, recruiter_notes: row.recruiter_notes || "", status: "imported", unparseable: true, parse_method: "manual", parse_warnings: ["Imported from Greenhouse metadata; upload a PDF or DOCX before screening."], review_status: "needs_review" }));
  const { data: candidates, error: insertError } = await supabase.from("candidates").insert(candidateRows).select("id, job_id, file_name, email, status, unparseable, parse_method, created_at");
  if (insertError) return res.status(500).json({ error: insertError.message });
  const ids = (candidates || []).map((candidate) => candidate.id);
  await Promise.all([
    supabase.from("candidate_activity").insert(ids.map((candidate_id) => ({ candidate_id, org_id: req.orgId, actor_id: req.userId || null, event_type: "candidate_imported", event_data: { source: "greenhouse" } }))),
    supabase.from("organization_audit_events").insert(ids.map((candidate_id) => ({ candidate_id, org_id: req.orgId, actor_id: req.userId || null, event_type: "candidate_imported", event_data: { source: "greenhouse" } }))),
  ]);
  res.status(201).json({ imported: candidates?.length || 0, skipped_duplicates: failures, candidates });
});

router.post("/jobs/:id/integrations/lever/candidates/import", uploadLimiter, async (req, res) => {
  const apiKey = req.body?.api_key;
  const postingId = req.body?.lever_posting_id;
  if (typeof apiKey !== "string" || typeof postingId !== "string") return res.status(400).json({ error: "api_key and lever_posting_id are required" });
  const { data: job, error: jobError } = await supabase.from("jobs").select("id").eq("id", req.params.id).eq("org_id", req.orgId).single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });
  let rows;
  try { rows = await fetchLeverOpportunities(apiKey, postingId); }
  catch (error) { return res.status(502).json({ error: error.message }); }
  const emails = rows.map((row) => row.email).filter(Boolean).map((email) => email.toLowerCase());
  const { data: existing, error: existingError } = emails.length ? await supabase.from("candidates").select("email").eq("job_id", job.id).eq("org_id", req.orgId).in("email", emails) : { data: [], error: null };
  if (existingError) return res.status(500).json({ error: existingError.message });
  const existingEmails = new Set((existing || []).map((row) => row.email));
  const fresh = rows.filter((row) => !row.email || !existingEmails.has(row.email.toLowerCase()));
  const candidateRows = fresh.map((row) => ({ job_id: job.id, org_id: req.orgId, file_name: row.file_name, email: row.email || null, phone: row.phone || null, linkedin_url: row.linkedin_url || null, recruiter_notes: row.recruiter_notes || "", status: "imported", unparseable: true, parse_method: "manual", parse_warnings: ["Imported from Lever metadata; upload a PDF or DOCX before screening."], review_status: "needs_review" }));
  if (!candidateRows.length) return res.status(200).json({ imported: 0, skipped_duplicates: rows.length, candidates: [] });
  const { data: candidates, error: insertError } = await supabase.from("candidates").insert(candidateRows).select("id, job_id, file_name, email, status, unparseable, parse_method, created_at");
  if (insertError) return res.status(500).json({ error: insertError.message });
  const ids = (candidates || []).map((candidate) => candidate.id);
  await Promise.all([
    supabase.from("candidate_activity").insert(ids.map((candidate_id) => ({ candidate_id, org_id: req.orgId, actor_id: req.userId || null, event_type: "candidate_imported", event_data: { source: "lever" } }))),
    supabase.from("organization_audit_events").insert(ids.map((candidate_id) => ({ candidate_id, org_id: req.orgId, actor_id: req.userId || null, event_type: "candidate_imported", event_data: { source: "lever" } }))),
  ]);
  res.status(201).json({ imported: candidates?.length || 0, skipped_duplicates: rows.length - fresh.length, candidates });
});

router.post("/jobs/:id/integrations/workable/candidates/import", uploadLimiter, async (req, res) => {
  const { api_key: apiKey, workable_account: account, workable_job_shortcode: shortcode } = req.body || {};
  if (typeof apiKey !== "string" || typeof account !== "string" || typeof shortcode !== "string") return res.status(400).json({ error: "api_key, workable_account, and workable_job_shortcode are required" });
  const { data: job, error: jobError } = await supabase.from("jobs").select("id").eq("id", req.params.id).eq("org_id", req.orgId).single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });
  let rows;
  try { rows = await fetchWorkableCandidates(apiKey, account, shortcode); }
  catch (error) { return res.status(502).json({ error: error.message }); }
  const emails = rows.map((row) => row.email).filter(Boolean).map((email) => email.toLowerCase());
  const { data: existing, error: existingError } = emails.length ? await supabase.from("candidates").select("email").eq("job_id", job.id).eq("org_id", req.orgId).in("email", emails) : { data: [], error: null };
  if (existingError) return res.status(500).json({ error: existingError.message });
  const existingEmails = new Set((existing || []).map((row) => row.email));
  const fresh = rows.filter((row) => !row.email || !existingEmails.has(row.email.toLowerCase()));
  const candidateRows = fresh.map((row) => ({ job_id: job.id, org_id: req.orgId, file_name: row.file_name, email: row.email || null, phone: row.phone || null, linkedin_url: row.linkedin_url || null, recruiter_notes: row.recruiter_notes || "", status: "imported", unparseable: true, parse_method: "manual", parse_warnings: ["Imported from Workable metadata; upload a PDF or DOCX before screening."], review_status: "needs_review" }));
  if (!candidateRows.length) return res.status(200).json({ imported: 0, skipped_duplicates: rows.length, candidates: [] });
  const { data: candidates, error: insertError } = await supabase.from("candidates").insert(candidateRows).select("id, job_id, file_name, email, status, unparseable, parse_method, created_at");
  if (insertError) return res.status(500).json({ error: insertError.message });
  const ids = (candidates || []).map((candidate) => candidate.id);
  await Promise.all([
    supabase.from("candidate_activity").insert(ids.map((candidate_id) => ({ candidate_id, org_id: req.orgId, actor_id: req.userId || null, event_type: "candidate_imported", event_data: { source: "workable" } }))),
    supabase.from("organization_audit_events").insert(ids.map((candidate_id) => ({ candidate_id, org_id: req.orgId, actor_id: req.userId || null, event_type: "candidate_imported", event_data: { source: "workable" } }))),
  ]);
  res.status(201).json({ imported: candidates?.length || 0, skipped_duplicates: rows.length - fresh.length, candidates });
});

router.post("/candidates/:id/provider-resume", uploadLimiter, async (req, res) => {
  const { provider, resume_url: resumeUrl, api_key: apiKey } = req.body || {};
  if (!["greenhouse", "lever", "workable"].includes(provider) || typeof resumeUrl !== "string") return res.status(400).json({ error: "provider and resume_url are required" });
  const { data: candidate, error: candidateError } = await supabase.from("candidates").select("id, job_id, org_id, file_name, parse_attempts").eq("id", req.params.id).eq("org_id", req.orgId).single();
  if (candidateError || !candidate) return res.status(404).json({ error: "candidate not found" });
  const { data: job, error: jobError } = await supabase.from("jobs").select("*").eq("id", candidate.job_id).eq("org_id", req.orgId).single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });
  let downloaded;
  try { downloaded = await downloadProviderResume(provider, resumeUrl, apiKey); }
  catch (error) { return res.status(400).json({ error: error.message }); }
  if (!hasExpectedFileSignature(downloaded.buffer, downloaded.ext)) return res.status(400).json({ error: "provider response is not a valid PDF or DOCX" });
  const storagePath = `${job.id}/${Date.now()}-${downloaded.fileName}`;
  const { error: uploadError } = await supabase.storage.from("resumes").upload(storagePath, downloaded.buffer, { contentType: downloaded.ext === ".pdf" ? "application/pdf" : ALLOWED_RESUME_CONTENT_TYPES[".docx"] });
  if (uploadError) return res.status(500).json({ error: uploadError.message });
  const { data: updated, error: updateError } = await supabase.from("candidates").update({ file_name: downloaded.fileName, file_path: storagePath, status: "queued", unparseable: false, error_message: null, parse_warnings: [], review_status: "needs_review" }).eq("id", candidate.id).eq("org_id", req.orgId).select("id, file_name, status, created_at").single();
  if (updateError) { await supabase.storage.from("resumes").remove([storagePath]); return res.status(500).json({ error: updateError.message }); }
  await supabase.from("candidate_activity").insert({ candidate_id: candidate.id, org_id: req.orgId, actor_id: req.userId || null, event_type: "provider_resume_attached", event_data: { provider, file_name: downloaded.fileName } });
  res.status(202).json(updated);
  enqueue(async () => {
    await processCandidateWithRetry(job, candidate.id, storagePath, downloaded.fileName, getSharedSkillEmbeddingCache());
    await notifyCandidateScreened(job, candidate.id, downloaded.fileName);
  });
});

export async function recoverStuckCandidates() {
  const { data: stuck, error } = await supabase
    .from("candidates")
    .select("id, job_id, file_path, file_name")
    .eq("status", "queued");
  if (error || !stuck || stuck.length === 0) return;

  console.log(`Recovering ${stuck.length} candidate(s) left queued from a previous run...`);
  const jobCache = new Map();
  const skillEmbeddingCache = getSharedSkillEmbeddingCache();
  for (const candidate of stuck) {
    let job = jobCache.get(candidate.job_id);
    if (!job) {
      const { data } = await supabase.from("jobs").select("*").eq("id", candidate.job_id).single();
      if (!data) {
        await supabase
          .from("candidates")
          .update({ status: "failed", error_message: "parent job no longer exists" })
          .eq("id", candidate.id);
        continue;
      }
      job = data;
      jobCache.set(candidate.job_id, job);
    }
    enqueue(async () => {
      await processCandidateWithRetry(job, candidate.id, candidate.file_path, candidate.file_name, skillEmbeddingCache);
      await notifyCandidateScreened(job, candidate.id, candidate.file_name);
    });
  }
}

router.get("/jobs/:id/candidates/status", async (req, res) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("id, status")
    .eq("job_id", req.params.id)
    .eq("org_id", req.orgId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/candidates/:id/reprocess", jobWriteLimiter, async (req, res) => {
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id, job_id, file_path, file_name, status, parse_attempts")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();
  if (candidateError || !candidate) return res.status(404).json({ error: "candidate not found" });
  if (!candidate.file_path) return res.status(400).json({ error: "this candidate has no stored resume to reprocess" });
  if (candidate.status === "queued") return res.status(409).json({ error: "candidate is already queued for processing" });
  if (Number(candidate.parse_attempts || 0) >= 3) return res.status(409).json({ error: "maximum parse attempts reached; upload a corrected resume instead" });

  const { data: job, error: jobError } = await supabase.from("jobs").select("*").eq("id", candidate.job_id).eq("org_id", req.orgId).single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });

  const { data: updated, error: updateError } = await supabase
    .from("candidates")
    .update({ status: "queued", unparseable: false, error_message: null, parse_warnings: [], review_status: "needs_review" })
    .eq("id", candidate.id)
    .eq("org_id", req.orgId)
    .select("id, status")
    .single();
  if (updateError) return res.status(500).json({ error: updateError.message });

  await supabase.from("candidate_activity").insert({ candidate_id: candidate.id, org_id: req.orgId, actor_id: req.userId || null, event_type: "reprocessing_requested", event_data: { previous_status: candidate.status } });
    enqueue(async () => {
      await processCandidateWithRetry(job, candidate.id, candidate.file_path, candidate.file_name, getSharedSkillEmbeddingCache());
      await notifyCandidateScreened(job, candidate.id, candidate.file_name);
    });
  res.status(202).json(updated);
});

router.get("/jobs/:id/candidates", async (req, res) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("job_id", req.params.id)
    .eq("org_id", req.orgId)
    .order("final_score", { ascending: false, nullsFirst: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/jobs/:id/compliance-notice", async (req, res) => {
  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();
  if (error || !job) return res.status(404).json({ error: "job not found" });

  const semanticWeight = Number(req.query.semanticWeight) || 60;
  const html = generateComplianceNoticeHtml(job, semanticWeight);
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

router.get("/jobs/:id/export", async (req, res) => {
  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("job_id", req.params.id)
    .eq("org_id", req.orgId)
    .order("final_score", { ascending: false, nullsFirst: false });

  if (error) return res.status(500).json({ error: error.message });

  const header = [
    "file_name",
    "final_score",
    "semantic_score",
    "skill_score",
    "matched_skills",
    "implied_skills",
    "missing_skills",
    "unparseable",
  ];
  // Neutralize CSV formula injection: file names are attacker-controlled
  // (an uploaded resume's original filename), and a value starting with
  // =, +, -, or @ is interpreted as a formula by Excel/Sheets when opened —
  // prefixing with a leading quote forces it to be read as plain text.
  const escape = (v) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = candidates.map((c) =>
    [
      c.file_name,
      c.final_score,
      c.semantic_score,
      c.skill_score,
      (c.matched_skills || []).join("; "),
      (c.implied_skills || []).join("; "),
      (c.missing_skills || []).join("; "),
      c.unparseable,
    ]
      .map(escape)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="candidates-${req.params.id}.csv"`);
  res.send(csv);
});

router.get("/jobs/:id/activity-export", async (req, res) => {
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });

  const { data: candidates, error: candidateError } = await supabase
    .from("candidates")
    .select("id, file_name")
    .eq("job_id", job.id)
    .eq("org_id", req.orgId);
  if (candidateError) return res.status(500).json({ error: candidateError.message });

  const ids = (candidates || []).map((candidate) => candidate.id);
  const activities = ids.length
    ? await supabase
        .from("candidate_activity")
        .select("candidate_id, actor_id, event_type, event_data, created_at")
        .eq("org_id", req.orgId)
        .in("candidate_id", ids)
        .order("created_at", { ascending: false })
    : { data: [], error: null };
  if (activities.error) return res.status(500).json({ error: activities.error.message });

  const candidateNames = new Map((candidates || []).map((candidate) => [candidate.id, candidate.file_name]));
  const header = ["timestamp", "candidate", "event_type", "actor_id", "event_data"];
  const escape = (value) => {
    let text = String(value ?? "");
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = (activities.data || []).map((event) => [
    event.created_at,
    candidateNames.get(event.candidate_id) || event.candidate_id,
    event.event_type,
    event.actor_id || "system",
    JSON.stringify(event.event_data || {}),
  ].map(escape).join(","));

  const safeTitle = (job.title || job.id).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}-activity.csv"`);
  res.send([header.map(escape).join(","), ...rows].join("\n"));
});

router.delete("/jobs/:id", orgActionLimiter, async (req, res) => {
  const jobId = req.params.id;

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, organizations!inner(created_by)")
    .eq("id", jobId)
    .eq("org_id", req.orgId)
    .single();
  if (!job) return res.status(404).json({ error: "job not found" });
  if (job.organizations?.created_by !== req.userId) return res.status(403).json({ error: "only the organization owner can delete a job" });

  await deleteJobCascade(job);

  res.status(204).send();
});

// Deletes a job along with every non-starred candidate (row + resume file).
// Starred candidates are preserved: detached from the job (job_id set to
// null) with a snapshot of the job title, since starring is meant to survive
// the job it was found under, both on manual delete and the 180-day sweep.
export async function deleteJobCascade(job) {
  const { data: candidates } = await supabase
    .from("candidates")
    .select("id, file_path, starred")
    .eq("job_id", job.id);

  const starred = (candidates || []).filter((c) => c.starred);
  const unstarred = (candidates || []).filter((c) => !c.starred);

  if (unstarred.length > 0) {
    const paths = unstarred.map((c) => c.file_path).filter(Boolean);
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from("resumes").remove(paths);
      if (storageError) {
        console.error(`Retention storage deletion failed for job ${job.id}; skipping deletion.`);
        return;
      }
    }
    const { error: auditError } = await supabase.from("organization_audit_events").insert(
      unstarred.map((candidate) => ({
        org_id: job.org_id,
        actor_id: null,
        candidate_id: candidate.id,
        event_type: "candidate_deleted",
        event_data: { reason: "retention_sweep", job_id: job.id },
      }))
    );
    if (auditError) {
      console.error(`Retention audit failed for job ${job.id}; skipping deletion.`);
      return;
    }
    await supabase
      .from("candidates")
      .delete()
      .in("id", unstarred.map((c) => c.id));
  }

  if (starred.length > 0) {
    await supabase
      .from("candidates")
      .update({ job_id: null, starred_job_title: job.title })
      .in("id", starred.map((c) => c.id));
  }

  await supabase.from("jobs").delete().eq("id", job.id);
}

export default router;
