import { Router } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { supabase } from "../supabaseClient.js";
import { getEmbedding } from "../services/embedding.js";
import { classifyDomain } from "../services/domainClassify.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8"));

const router = Router();

// Stable, opaque label from a seeker id — no PII. e.g. "Candidate 3F9A2C".
function anonLabel(id) {
  return `Candidate ${String(id).replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

// Resolve a query embedding (+ its text, for explain) from either a pasted JD or
// an existing org-owned job's stored embedding.
async function resolveQuery({ description, jobId, orgId }) {
  if (jobId) {
    const { data: job } = await supabase
      .from("jobs")
      .select("jd_embedding, description")
      .eq("id", jobId)
      .eq("org_id", orgId)
      .single();
    if (!job?.jd_embedding) return null;
    return { embedding: job.jd_embedding, text: job.description || "" };
  }
  if (description && description.trim()) {
    return { embedding: await getEmbedding(description), text: description };
  }
  return null;
}

// Search the OPTED-IN seeker pool by a JD. Results are anonymized (label + fit
// only). The consent gate lives in match_seekers (visible_to_recruiters = true).
router.post("/talent/search", async (req, res) => {
  const { description, jobId, limit } = req.body || {};
  const query = await resolveQuery({ description, jobId, orgId: req.orgId });
  if (!query) return res.status(400).json({ error: "provide either a description or a valid jobId" });

  const queryEmbedding =
    typeof query.embedding === "string" ? JSON.parse(query.embedding) : query.embedding;

  const { data, error } = await supabase.rpc("match_seekers", {
    query_embedding: queryEmbedding,
    match_count: Math.min(Number(limit) || 20, 100),
  });
  if (error) return res.status(500).json({ error: error.message });

  res.json((data || []).map((r) => ({ id: r.id, label: anonLabel(r.id), similarity: r.similarity })));
});

// On-demand "why this candidate fits" for one opted-in seeker — still anonymized
// (no name/email/contact). Skill overlap is derived the same way as elsewhere:
// classify the JD's domain, take its skills, and check the resume against them.
router.post("/talent/:seekerResumeId/explain", async (req, res) => {
  const { description, jobId } = req.body || {};
  const query = await resolveQuery({ description, jobId, orgId: req.orgId });
  if (!query) return res.status(400).json({ error: "provide either a description or a valid jobId" });

  const { data: seeker } = await supabase
    .from("seeker_resumes")
    .select("resume_text, visible_to_recruiters")
    .eq("id", req.params.seekerResumeId)
    .single();
  if (!seeker || !seeker.visible_to_recruiters || !seeker.resume_text) {
    return res.status(404).json({ error: "candidate not available" });
  }

  let jdSkills = [];
  if (query.embedding) {
    const domain = await classifyDomain(query.embedding);
    jdSkills = extractSkills(query.text, taxonomy[domain] || taxonomy.tech);
  }
  if (jdSkills.length === 0) {
    jdSkills = extractKeyphrases(query.text, { minWordsPerPhrase: 2 });
  }

  const seekerSkills = extractSkills(seeker.resume_text, { keyphrases: jdSkills });
  const { matched, missing } = compareSkills(jdSkills, seekerSkills);

  res.json({ label: anonLabel(req.params.seekerResumeId), has: matched, lacks: missing });
});

export default router;
