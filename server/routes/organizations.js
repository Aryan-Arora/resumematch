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
    .select("id, name, join_code")
    .eq("id", req.orgId)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ organization: data });
});

// Privacy portability endpoint. The export is deliberately scoped to the
// authenticated organisation and excludes resume binaries/storage paths; it
// contains the structured data recruiters can review, correct, or hand to a
// data-subject request workflow.
router.get("/organizations/export", async (req, res) => {
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
