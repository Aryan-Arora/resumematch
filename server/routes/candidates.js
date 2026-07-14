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
