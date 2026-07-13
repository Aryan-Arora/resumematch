import { supabase } from "../supabaseClient.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.header("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return res.status(401).json({ error: "unauthorized" });

  req.userId = data.user.id;
  req.userEmail = data.user.email;

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", req.userId)
    .maybeSingle();
  req.orgId = profile?.org_id || null;

  next();
}

// Membership in an organization is what scopes jobs/candidates/analytics —
// a signed-in user with no org yet (hasn't created or joined one) shouldn't
// be able to touch any of that data.
export function requireOrg(req, res, next) {
  if (!req.orgId) {
    return res
      .status(403)
      .json({ error: "no_organization", message: "Join or create an organization first." });
  }
  next();
}
