import rateLimit from "express-rate-limit";

// Authenticated routes had no rate limiting at all — a single compromised
// or misbehaving account could hammer the compute-heavy embedding endpoints
// (job creation, resume upload) and degrade the shared single-instance
// server for every other organization. Keyed by user id, not IP, since IP
// limiting doesn't stop one account cycling networks and would unfairly
// throttle multiple legitimate teammates behind the same office IP.
function byUser(req) {
  return req.userId || req.ip;
}

export const jobWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: byUser,
  message: { error: "Too many jobs created — please wait a few minutes and try again." },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: byUser,
  message: { error: "Too many upload requests — please wait a few minutes and try again." },
});

export const orgActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: byUser,
  message: { error: "Too many attempts — please wait a few minutes and try again." },
});
