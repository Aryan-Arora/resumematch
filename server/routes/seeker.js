import { Router } from "express";
import multer from "multer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import { supabase } from "../supabaseClient.js";
import { parsePdf, parseDocx, extractEmail } from "../services/parsing.js";
import { getEmbedding } from "../services/embedding.js";
import { searchJobsByEmbedding } from "../services/vectorSearch.js";
import { classifyDomain } from "../services/domainClassify.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8"));

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);
const CONTENT_TYPES = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Same hardening as the recruiter upload: extension allowlist, memory storage,
// one file at a time (a seeker uploads their own resume, not a batch).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter(req, file, cb) {
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      const err = new Error("Only .pdf and .docx resumes are accepted.");
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

// Columns safe to return to the owner (never the embedding or raw resume_text).
const PUBLIC_COLUMNS = "id, file_name, email, visible_to_recruiters, unparseable, created_at";

const router = Router();

// Upload the seeker's own resume: store the file, parse it, embed it.
router.post("/seeker/resumes", upload.single("resume"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "a resume file is required" });

  const ext = extname(file.originalname).toLowerCase();
  const safeBasename = file.originalname
    .replace(/[/\\]/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100);
  const storagePath = `seeker/${req.userId}/${Date.now()}-${safeBasename}`;

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(storagePath, file.buffer, { contentType: CONTENT_TYPES[ext] });
  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const parsed = ext === ".pdf" ? await parsePdf(file.buffer) : await parseDocx(file.buffer);

  const record = {
    owner_id: req.userId,
    file_name: file.originalname,
    file_path: storagePath,
  };
  if (parsed.unparseable) {
    record.unparseable = true;
  } else {
    record.resume_text = parsed.text;
    record.email = extractEmail(parsed.text);
    record.embedding = await getEmbedding(parsed.text);
  }

  const { data, error } = await supabase
    .from("seeker_resumes")
    .insert(record)
    .select(PUBLIC_COLUMNS)
    .single();
  if (error) {
    await supabase.storage.from("resumes").remove([storagePath]);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

// List the seeker's resumes.
router.get("/seeker/resumes", async (req, res) => {
  const { data, error } = await supabase
    .from("seeker_resumes")
    .select(PUBLIC_COLUMNS)
    .eq("owner_id", req.userId)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// The core seeker experience: resume -> ranked live jobs. Kept fast (semantic
// ranking only); per-job "why / gap" is fetched on demand via the explain
// route below when the seeker opens a specific job.
router.get("/seeker/resumes/:id/matches", async (req, res) => {
  const { data: resume, error } = await supabase
    .from("seeker_resumes")
    .select("id, embedding, unparseable")
    .eq("id", req.params.id)
    .eq("owner_id", req.userId)
    .single();
  if (error || !resume) return res.status(404).json({ error: "resume not found" });
  if (resume.unparseable || !resume.embedding) {
    return res.status(400).json({ error: "this resume could not be read — try re-uploading it" });
  }

  const limit = Math.min(Number(req.query.limit) || 20, 50);
  try {
    const jobs = await searchJobsByEmbedding(resume.embedding, { limit });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// "Why it matched" + "the gap" for one job, computed the same way the recruiter
// side derives a JD's skills: classify the job's domain, pull its taxonomy, and
// fall back to keyphrase extraction when the taxonomy finds nothing — then check
// which of those the resume demonstrates.
router.get("/seeker/resumes/:id/matches/:jobId/explain", async (req, res) => {
  const { data: resume } = await supabase
    .from("seeker_resumes")
    .select("resume_text, embedding, unparseable")
    .eq("id", req.params.id)
    .eq("owner_id", req.userId)
    .single();
  if (!resume || resume.unparseable || !resume.resume_text) {
    return res.status(404).json({ error: "resume not found or unreadable" });
  }

  const { data: job } = await supabase
    .from("job_listings")
    .select("id, title, company, description, embedding")
    .eq("id", req.params.jobId)
    .single();
  if (!job) return res.status(404).json({ error: "job not found" });

  let jobSkills = [];
  if (job.embedding) {
    const domain = await classifyDomain(job.embedding);
    jobSkills = extractSkills(job.description || "", taxonomy[domain] || taxonomy.tech);
  }
  if (jobSkills.length === 0) {
    jobSkills = extractKeyphrases(job.description || job.title || "", { minWordsPerPhrase: 2 });
  }

  // Which of the job's required skills does the resume actually demonstrate?
  const resumeSkills = extractSkills(resume.resume_text, { keyphrases: jobSkills });
  const { matched, missing } = compareSkills(jobSkills, resumeSkills);

  res.json({
    job_id: job.id,
    title: job.title,
    company: job.company,
    why_matched: matched, // job requirements the resume demonstrates
    gaps: missing, // job requirements the resume is missing — "the gap"
  });
});

// Consent toggle for the future opt-in talent marketplace (M6). Off by default.
router.patch("/seeker/resumes/:id/visibility", async (req, res) => {
  const { visible } = req.body || {};
  const { data, error } = await supabase
    .from("seeker_resumes")
    .update({ visible_to_recruiters: !!visible })
    .eq("id", req.params.id)
    .eq("owner_id", req.userId)
    .select("id, visible_to_recruiters")
    .single();
  if (error || !data) return res.status(404).json({ error: "resume not found" });
  res.json(data);
});

router.delete("/seeker/resumes/:id", async (req, res) => {
  const { data: resume } = await supabase
    .from("seeker_resumes")
    .select("file_path")
    .eq("id", req.params.id)
    .eq("owner_id", req.userId)
    .single();
  if (resume?.file_path) {
    await supabase.storage.from("resumes").remove([resume.file_path]);
  }
  const { error } = await supabase
    .from("seeker_resumes")
    .delete()
    .eq("id", req.params.id)
    .eq("owner_id", req.userId);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
