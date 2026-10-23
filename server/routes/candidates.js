import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { sendShortlistEmail, sendCandidateEmail } from "../services/mailer.js";
import { shortlistLimiter } from "../middleware/rateLimit.js";

const router = Router();

async function isOrganizationMember(userId, orgId) {
  if (!userId || typeof userId !== "string") return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

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
    .select("file_path, file_name")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();
  if (fetchError || !candidate) return res.status(404).json({ error: "candidate not found" });
  if (!candidate.file_path) return res.status(404).json({ error: "no file stored for this candidate" });

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(candidate.file_path, 60);
  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("organization_audit_events").insert({
    org_id: req.orgId,
    actor_id: req.userId || null,
    candidate_id: req.params.id,
    event_type: "resume_viewed",
    event_data: { file_name: candidate.file_name },
  });

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
  await supabase.from("organization_audit_events").insert({
    org_id: req.orgId,
    actor_id: req.userId || null,
    candidate_id: data.id,
    event_type: data.starred ? "candidate_starred" : "candidate_unstarred",
    event_data: {},
  });
  res.json(data);
});

router.patch("/candidates/:id/workflow", async (req, res) => {
  const allowedStages = new Set(["new", "screening", "shortlisted", "interview", "offer", "rejected"]);
  const stage = typeof req.body.pipeline_stage === "string" ? req.body.pipeline_stage : undefined;
  const notes = typeof req.body.recruiter_notes === "string" ? req.body.recruiter_notes.trim().slice(0, 5000) : undefined;
  const tags = Array.isArray(req.body.tags) ? [...new Set(req.body.tags.filter((tag) => typeof tag === "string").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 20) : undefined;
  const reminderAt = req.body.reminder_at === null || typeof req.body.reminder_at === "string" ? req.body.reminder_at : undefined;
  const assignedTo = req.body.assigned_to === null || typeof req.body.assigned_to === "string" ? req.body.assigned_to : undefined;
  if (!stage && notes === undefined && tags === undefined && reminderAt === undefined && assignedTo === undefined) return res.status(400).json({ error: "workflow change is required" });
  if (stage && !allowedStages.has(stage)) return res.status(400).json({ error: "invalid pipeline stage" });
  if (reminderAt && (Number.isNaN(Date.parse(reminderAt)) || !/^\d{4}-\d{2}-\d{2}T/.test(reminderAt))) {
    return res.status(400).json({ error: "reminder_at must be an ISO timestamp" });
  }
  if (assignedTo) {
    try {
      if (!(await isOrganizationMember(assignedTo, req.orgId))) {
        return res.status(400).json({ error: "assigned_to must be an active member of this organization" });
      }
    } catch (error) {
      console.error("Failed to validate candidate assignee", error);
      return res.status(500).json({ error: "Could not validate candidate assignee" });
    }
  }
  const update = {};
  if (stage) update.pipeline_stage = stage;
  if (notes !== undefined) update.recruiter_notes = notes;
  if (tags !== undefined) update.tags = tags;
  if (reminderAt !== undefined) update.reminder_at = reminderAt || null;
  if (assignedTo !== undefined) update.assigned_to = assignedTo || null;
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

// Recruiters can correct contact extraction without editing the original
// resume. This is intentionally narrow and organization-scoped so a manual
// correction cannot alter the model's stored scores or eligibility evidence.
router.patch("/candidates/:id/contact", async (req, res) => {
  const fields = ["email", "phone", "linkedin_url", "portfolio_url"];
  const update = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      if (req.body[field] !== null && typeof req.body[field] !== "string") {
        return res.status(400).json({ error: `${field} must be a string or null` });
      }
      update[field] = typeof req.body[field] === "string" ? req.body[field].trim().slice(0, 500) || null : null;
    }
  }
  if (!Object.keys(update).length) return res.status(400).json({ error: "at least one contact field is required" });
  if (update.email && (!/^\S+@\S+\.\S+$/.test(update.email) || update.email.length > 320)) {
    return res.status(400).json({ error: "email must be a valid address" });
  }
  for (const field of ["linkedin_url", "portfolio_url"]) {
    if (update[field]) {
      try {
        const url = new URL(update[field]);
        if (url.protocol !== "https:") throw new Error("invalid protocol");
      } catch {
        return res.status(400).json({ error: `${field} must be an https URL` });
      }
    }
  }
  const { data, error } = await supabase
    .from("candidates")
    .update(update)
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .select()
    .single();
  if (error || !data) return res.status(404).json({ error: "candidate not found" });
  await supabase.from("candidate_activity").insert({
    candidate_id: data.id,
    org_id: req.orgId,
    actor_id: req.userId || null,
    event_type: "contact_corrected",
    event_data: { fields: Object.keys(update) },
  });
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
  if (data?.length) {
    await supabase.from("candidate_activity").insert(data.map((candidate) => ({
      candidate_id: candidate.id,
      org_id: req.orgId,
      actor_id: req.userId || null,
      event_type: "bulk_workflow_updated",
      event_data: { pipeline_stage: stage },
    })));
  }
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

router.post("/candidates/:id/email", shortlistLimiter, async (req, res) => {
  const type = ["shortlist", "interview", "rejection"].includes(req.body.type) ? req.body.type : "";
  if (!type) return res.status(400).json({ error: "email type must be shortlist, interview, or rejection" });
  const { data: candidate, error } = await supabase.from("candidates").select("*, jobs(title, interview_url, email_templates), organizations(name)").eq("id", req.params.id).eq("org_id", req.orgId).single();
  if (error || !candidate) return res.status(404).json({ error: "candidate not found" });
  if (!candidate.email) return res.status(400).json({ error: "no email address was found on this candidate's resume" });
  const candidateName = (candidate.file_name || "").replace(/\.(pdf|docx)$/i, "").replace(/[_-]+/g, " ").trim() || "there";
  try {
    await sendCandidateEmail({ to: candidate.email, candidateName, jobTitle: candidate.jobs?.title || "the role", orgName: candidate.organizations?.name, type, template: candidate.jobs?.email_templates?.[type], interviewUrl: candidate.jobs?.interview_url });
  } catch (err) { return res.status(err.status || 500).json({ error: err.message }); }
  await supabase.from("candidate_activity").insert({ candidate_id: candidate.id, org_id: req.orgId, actor_id: req.userId || null, event_type: "email_sent", event_data: { type } });
  res.json({ sent: true, type });
});

router.delete("/candidates/:id", async (req, res) => {
  const { data: candidate, error: fetchError } = await supabase
    .from("candidates")
    .select("id, file_path, file_name")
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .single();
  if (fetchError) return res.status(404).json({ error: "candidate not found" });

  if (candidate.file_path) {
    await supabase.storage.from("resumes").remove([candidate.file_path]);
  }

  await supabase.from("organization_audit_events").insert({
    org_id: req.orgId,
    actor_id: req.userId || null,
    candidate_id: candidate.id,
    event_type: "candidate_deleted",
    event_data: { file_name: candidate.file_name, reason: "recruiter_action" },
  });

  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", req.params.id)
    .eq("org_id", req.orgId);
  if (error) return res.status(500).json({ error: error.message });

  res.status(204).send();
});

export default router;
