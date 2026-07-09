import { supabase } from "../supabaseClient.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.header("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return res.status(401).json({ error: "unauthorized" });

  req.userEmail = data.user.email;
  req.companyDomain = data.user.email.split("@")[1].toLowerCase();
  next();
}
