export function requireAuth(req, res, next) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    // No password configured (e.g. local dev) — auth is disabled.
    return next();
  }
  const provided = req.header("x-api-key");
  if (provided !== expected) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}
