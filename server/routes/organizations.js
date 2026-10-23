import { Router } from "express";
import crypto from "crypto";
import { supabase } from "../supabaseClient.js";
import { orgActionLimiter } from "../middleware/rateLimit.js";

const router = Router();

// Excludes visually ambiguous characters (0/O, 1/I/L) since codes get typed
// in by hand and read off screens/whiteboards.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateJoinCode() {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

async function generateUniqueJoinCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateJoinCode();
    const { data } = await supabase.from("organizations").select("id").eq("join_code", code).maybeSingle();
    if (!data) return code;
  }
  throw new Error("Could not generate a unique organization code — try again.");
}

router.get("/organizations/me", async (req, res) => {
  if (!req.orgId) return res.json({ organization: null });
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, join_code, retention_days")
    .eq("id", req.orgId)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ organization: data });
});

// Privacy portability endpoint. The export is deliberately scoped to the
// authenticated organisation and excludes resume binaries/storage paths; it
// contains the structured data recruiters can review, correct, or hand to a
// data-subject request workflow.
router.get("/organizations/export", orgActionLimiter, async (req, res) => {
  const [jobsResult, candidatesResult, activityResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, description, jd_skills, jd_domain, created_at, interview_url, email_templates")
      .eq("org_id", req.orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("candidates")
      .select("id, job_id, file_name, resume_text, email, phone, linkedin_url, portfolio_url, semantic_score, skill_score, final_score, missing_skills, matched_skills, implied_skills, parse_warnings, unparseable, parse_attempts, pipeline_stage, recruiter_notes, tags, reminder_at, assigned_to, starred, starred_at, match_feedback, match_feedback_note, created_at")
      .eq("org_id", req.orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("candidate_activity")
      .select("id, candidate_id, actor_id, event_type, event_data, created_at")
      .eq("org_id", req.orgId)
      .order("created_at", { ascending: false }),
  ]);

  const failed = [jobsResult, candidatesResult, activityResult].find((result) => result.error);
  if (failed) return res.status(500).json({ error: failed.error.message });

  const payload = {
    exported_at: new Date().toISOString(),
    organization_id: req.orgId,
    jobs: jobsResult.data || [],
    candidates: candidatesResult.data || [],
    candidate_activity: activityResult.data || [],
  };
  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="resumematch-organization-export-${stamp}.json"`);
  res.json(payload);
});

router.get("/organizations/members", async (req, res) => {
  const { data: profiles, error } = await supabase.from("profiles").select("id").eq("org_id", req.orgId);
  if (error) return res.status(500).json({ error: error.message });
  const users = [];
  for (const profile of profiles || []) {
    const { data } = await supabase.auth.admin.getUserById(profile.id);
    if (data?.user) users.push({ id: data.user.id, email: data.user.email });
  }
  res.json(users);
});

router.get("/organizations/deletion-requests", async (req, res) => {
  const { data, error } = await supabase
    .from("candidate_deletion_requests")
    .select("id, candidate_id, email, status, notes, created_at, resolved_at")
    .eq("org_id", req.orgId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.patch("/organizations/deletion-requests/:id", orgActionLimiter, async (req, res) => {
  const status = req.body?.status;
  if (!['resolved', 'rejected'].includes(status)) return res.status(400).json({ error: "status must be resolved or rejected" });
  const notes = typeof req.body?.notes === "string" ? req.body.notes.trim().slice(0, 2000) : "";
  const { data: organization } = await supabase.from("organizations").select("created_by").eq("id", req.orgId).single();
  if (!organization) return res.status(404).json({ error: "organization not found" });
  if (organization.created_by !== req.userId) return res.status(403).json({ error: "only the organization owner can resolve deletion requests" });
  const { data, error } = await supabase
    .from("candidate_deletion_requests")
    .update({ status, notes, resolved_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("org_id", req.orgId)
    .eq("status", "pending")
    .select()
    .single();
  if (error || !data) return res.status(404).json({ error: "pending deletion request not found" });
  if (status === "resolved" && data.candidate_id) {
    const { data: candidate } = await supabase.from("candidates").select("file_path").eq("id", data.candidate_id).eq("org_id", req.orgId).maybeSingle();
    if (candidate?.file_path) await supabase.storage.from("resumes").remove([candidate.file_path]);
    await supabase.from("candidates").delete().eq("id", data.candidate_id).eq("org_id", req.orgId);
  }
  res.json(data);
});

router.patch("/organizations/settings", orgActionLimiter, async (req, res) => {
  const retentionDays = Number.parseInt(req.body?.retention_days, 10);
  if (!Number.isInteger(retentionDays) || retentionDays < 30 || retentionDays > 3650) {
    return res.status(400).json({ error: "retention_days must be an integer between 30 and 3650" });
  }
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("created_by")
    .eq("id", req.orgId)
    .single();
  if (organizationError || !organization) return res.status(404).json({ error: "organization not found" });
  if (organization.created_by !== req.userId) return res.status(403).json({ error: "only the organization owner can change retention settings" });
  const { data, error } = await supabase
    .from("organizations")
    .update({ retention_days: retentionDays })
    .eq("id", req.orgId)
    .select("id, name, join_code, retention_days")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ organization: data });
});

router.post("/organizations", orgActionLimiter, async (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Organization name is required." });
  }
  if (req.orgId) {
    return res.status(400).json({ error: "You're already part of an organization." });
  }

  try {
    const joinCode = await generateUniqueJoinCode();
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: name.trim(), join_code: joinCode, created_by: req.userId })
      .select()
      .single();
    if (orgError) return res.status(500).json({ error: orgError.message });

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: req.userId, org_id: org.id });
    if (profileError) return res.status(500).json({ error: profileError.message });

    res.status(201).json({ organization: org });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/organizations/join", orgActionLimiter, async (req, res) => {
  const { code } = req.body || {};
  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Enter an organization code." });
  }
  if (req.orgId) {
    return res.status(400).json({ error: "You're already part of an organization." });
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, join_code")
    .eq("join_code", code.trim().toUpperCase())
    .maybeSingle();
  if (orgError) return res.status(500).json({ error: orgError.message });
  if (!org) return res.status(404).json({ error: "No organization found with that code." });

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: req.userId, org_id: org.id });
  if (profileError) return res.status(500).json({ error: profileError.message });

  res.json({ organization: org });
});

export default router;
