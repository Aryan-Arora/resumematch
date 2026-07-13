import { Router } from "express";
import crypto from "crypto";
import { supabase } from "../supabaseClient.js";

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

router.post("/organizations", async (req, res) => {
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

router.post("/organizations/join", async (req, res) => {
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
