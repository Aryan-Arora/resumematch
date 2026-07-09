import { Router } from "express";
import multer from "multer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import { supabase } from "../supabaseClient.js";
import { parsePdf, parseDocx } from "../services/parsing.js";
import { getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { computeFinalScore } from "../services/scoring.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(
  readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8")
);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES_PER_UPLOAD = 100;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES_PER_UPLOAD,
  },
});
const router = Router();

router.get("/jobs", async (req, res) => {
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, description, jd_skills, created_at")
    .order("created_at", { ascending: false });
  if (jobsError) return res.status(500).json({ error: jobsError.message });

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("job_id, final_score, unparseable");
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

router.post("/jobs", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "title and description are required" });
  }

  const jdEmbedding = await getEmbedding(description);
  const jdSkills = extractSkills(description, taxonomy);

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title,
      description,
      jd_embedding: jdEmbedding,
      jd_skills: jdSkills,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.post("/jobs/:id/candidates", upload.array("resumes"), async (req, res) => {
  const jobId = req.params.id;
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "at least one resume file is required" });
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();
  if (jobError || !job) return res.status(404).json({ error: "job not found" });

  const results = [];
  const failures = [];

  for (const file of files) {
    try {
      const ext = extname(file.originalname).toLowerCase();
      let parsed;
      if (ext === ".pdf") {
        parsed = await parsePdf(file.buffer);
      } else if (ext === ".docx") {
        parsed = await parseDocx(file.buffer);
      } else {
        parsed = { text: "", unparseable: true };
      }

      if (parsed.unparseable) {
        const { data, error } = await supabase
          .from("candidates")
          .insert({
            job_id: jobId,
            file_name: file.originalname,
            unparseable: true,
          })
          .select()
          .single();
        if (error) throw error;
        results.push(data);
        continue;
      }

      const storagePath = `${jobId}/${Date.now()}-${file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(storagePath, file.buffer, { contentType: file.mimetype });
      if (uploadError) throw uploadError;

      const resumeEmbedding = await getEmbedding(parsed.text);
      const semanticScore = cosineSimilarity(job.jd_embedding, resumeEmbedding);

      const resumeSkills = extractSkills(parsed.text, taxonomy);
      const { matched, missing } = compareSkills(job.jd_skills, resumeSkills);
      const skillScore = job.jd_skills.length > 0 ? matched.length / job.jd_skills.length : 0;
      const finalScore = computeFinalScore(semanticScore, skillScore);

      const { data, error } = await supabase
        .from("candidates")
        .insert({
          job_id: jobId,
          file_name: file.originalname,
          file_path: storagePath,
          resume_text: parsed.text,
          resume_embedding: resumeEmbedding,
          matched_skills: matched,
          missing_skills: missing,
          semantic_score: semanticScore,
          skill_score: skillScore,
          final_score: finalScore,
          unparseable: false,
        })
        .select()
        .single();

      if (error) {
        // Insert failed after the file was already uploaded to storage — clean up the orphaned file.
        await supabase.storage.from("resumes").remove([storagePath]);
        throw error;
      }
      results.push(data);
    } catch (err) {
      failures.push({ file_name: file.originalname, error: err.message || String(err) });
    }
  }

  res.status(201).json({ candidates: results, failures });
});

router.get("/jobs/:id/candidates", async (req, res) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("job_id", req.params.id)
    .order("final_score", { ascending: false, nullsFirst: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/jobs/:id/export", async (req, res) => {
  const { data: candidates, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("job_id", req.params.id)
    .order("final_score", { ascending: false, nullsFirst: false });

  if (error) return res.status(500).json({ error: error.message });

  const header = [
    "file_name",
    "final_score",
    "semantic_score",
    "skill_score",
    "matched_skills",
    "missing_skills",
    "unparseable",
  ];
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = candidates.map((c) =>
    [
      c.file_name,
      c.final_score,
      c.semantic_score,
      c.skill_score,
      (c.matched_skills || []).join("; "),
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

router.delete("/jobs/:id", async (req, res) => {
  const jobId = req.params.id;

  const { data: files } = await supabase.storage.from("resumes").list(jobId);
  if (files && files.length > 0) {
    await supabase.storage.from("resumes").remove(files.map((f) => `${jobId}/${f.name}`));
  }

  const { error, count } = await supabase
    .from("jobs")
    .delete({ count: "exact" })
    .eq("id", jobId);
  if (error) return res.status(500).json({ error: error.message });
  if (count === 0) return res.status(404).json({ error: "job not found" });

  res.status(204).send();
});

export default router;
