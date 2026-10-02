import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { sendShortlistEmail } from "../services/mailer.js";
import { shortlistLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.get("/candidates/starred", async (req, res) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("*, jobs(title)")
    .eq("org_id", req.orgId)
    .eq("starred", true)
    .order("starred_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const result = data.map((c) => {
    const { jobs, ...rest } = c;
    return { ...rest, job_title: jobs?.title || c.starred_job_title || "Job deleted" };
  });
  res.json(result);
});

router.get("/candidates/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();

  if (error) return res.status(404).json({ error: "candidate not found" });
  res.json(data);
});

router.get("/candidates/:id/resume", async (req, res) => {
  const { data: candidate, error: fetchError } = await supabase
    .from("candidates")
    .select("file_path")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();
  if (fetchError || !candidate) return res.status(404).json({ error: "candidate not found" });
  if (!candidate.file_path) return res.status(404).json({ error: "no file stored for this candidate" });

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(candidate.file_path, 60);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ url: data.signedUrl });
});

router.patch("/candidates/:id/star", async (req, res) => {
  const { starred } = req.body;
  const { data, error } = await supabase
    .from("candidates")
    .update({ starred: !!starred, starred_at: starred ? new Date().toISOString() : null })
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .select()
    .single();
  if (error || !data) return res.status(404).json({ error: "candidate not found" });
  res.json(data);
});

router.patch("/candidates/:id/workflow", async (req, res) => {
  const allowedStages = new Set(["new", "screening", "shortlisted", "interview", "offer", "rejected"]);
  const stage = typeof req.body.pipeline_stage === "string" ? req.body.pipeline_stage : undefined;
  const notes = typeof req.body.recruiter_notes === "string" ? req.body.recruiter_notes.trim().slice(0, 5000) : undefined;
  const tags = Array.isArray(req.body.tags) ? [...new Set(req.body.tags.filter((tag) => typeof tag === "string").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 20) : undefined;
  if (!stage && notes === undefined && tags === undefined) return res.status(400).json({ error: "stage, notes, or tags are required" });
  if (stage && !allowedStages.has(stage)) return res.status(400).json({ error: "invalid pipeline stage" });
  const update = {};
  if (stage) update.pipeline_stage = stage;
  if (notes !== undefined) update.recruiter_notes = notes;
  if (tags !== undefined) update.tags = tags;
  const { data, error } = await supabase.from("candidates").update(update).eq("id", req.params.id).eq("org_id", req.orgId).select().single();
  if (error || !data) return res.status(404).json({ error: "candidate not found" });
  await supabase.from("candidate_activity").insert({ candidate_id: data.id, org_id: req.orgId, actor_id: req.userId || null, event_type: "workflow_updated", event_data: update });
  res.json(data);
});

router.patch("/candidates/:id/feedback", async (req, res) => {
  const allowed = new Set(["accurate", "inaccurate", "unclear"]);
  if (!allowed.has(req.body.match_feedback)) return res.status(400).json({ error: "invalid feedback value" });
  const note = typeof req.body.match_feedback_note === "string" ? req.body.match_feedback_note.trim().slice(0, 2000) : "";
  const { data, error } = await supabase.from("candidates").update({ match_feedback: req.body.match_feedback, match_feedback_note: note }).eq("id", req.params.id).eq("org_id", req.orgId).select().single();
  if (error || !data) return res.status(404).json({ error: "candidate not found" });
  await supabase.from("candidate_activity").insert({ candidate_id: data.id, org_id: req.orgId, actor_id: req.userId || null, event_type: "match_feedback", event_data: { feedback: req.body.match_feedback, note } });
  res.json(data);
});

router.get("/candidates/:id/activity", async (req, res) => {
  const { data, error } = await supabase.from("candidate_activity").select("*").eq("candidate_id", req.params.id).eq("org_id", req.orgId).order("created_at", { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post("/candidates/bulk-workflow", async (req, res) => {
  const ids = Array.isArray(req.body.candidate_ids) ? req.body.candidate_ids.slice(0, 100) : [];
  const stage = typeof req.body.pipeline_stage === "string" ? req.body.pipeline_stage : "";
  if (!ids.length || !["new", "screening", "shortlisted", "interview", "offer", "rejected"].includes(stage)) return res.status(400).json({ error: "candidate_ids and a valid pipeline_stage are required" });
  const { data, error } = await supabase.from("candidates").update({ pipeline_stage: stage }).in("id", ids).eq("org_id", req.orgId).select("id, pipeline_stage");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post("/candidates/:id/shortlist", shortlistLimiter, async (req, res) => {
  const { data: candidate, error: fetchError } = await supabase
    .from("candidates")
    .select("*, jobs(title), organizations(name)")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();
  if (fetchError || !candidate) return res.status(404).json({ error: "candidate not found" });
  if (!candidate.email) {
    return res.status(400).json({ error: "no email address was found on this candidate's resume" });
  }
  if (candidate.shortlist_email_sent_at) {
    return res.status(409).json({ error: "shortlist email was already sent to this candidate" });
  }

  const candidateName =
    (candidate.file_name || "")
      .replace(/\.(pdf|docx)$/i, "")
      .replace(/[_-]+/g, " ")
      .trim() || "there";

  try {
    await sendShortlistEmail({
      to: candidate.email,
      candidateName,
      jobTitle: candidate.jobs?.title || candidate.starred_job_title || "the role",
      orgName: candidate.organizations?.name,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("candidates")
    .update({ shortlisted: true, shortlisted_at: now, shortlist_email_sent_at: now })
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete("/candidates/:id", async (req, res) => {
  const { data: candidate, error: fetchError } = await supabase
    .from("candidates")
    .select("file_path")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();
  if (fetchError) return res.status(404).json({ error: "candidate not found" });

  if (candidate.file_path) {
    await supabase.storage.from("resumes").remove([candidate.file_path]);
  }

  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", req.params.id)
    .eq("org_id", req.orgId);
  if (error) return res.status(500).json({ error: error.message });

  res.status(204).send();
});

export default router;
