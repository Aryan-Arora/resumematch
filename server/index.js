import express from "express";
import { randomUUID } from "node:crypto";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import * as Sentry from "@sentry/node";
import jobsRouter, { recoverStuckCandidates } from "./routes/jobs.js";
import candidatesRouter from "./routes/candidates.js";
import taxonomyRouter from "./routes/taxonomy.js";
import analyticsRouter from "./routes/analytics.js";
import authRouter from "./routes/auth.js";
import publicRouter from "./routes/public.js";
import organizationsRouter from "./routes/organizations.js";
import { supabase } from "./supabaseClient.js";
import { requireAuth, requireOrg } from "./middleware/auth.js";
import { scheduleRetentionSweep } from "./services/retention.js";
import { warmModels } from "./services/warmup.js";
import { waitForQueueIdle } from "./services/uploadQueue.js";
import openapiRouter from "./routes/openapi.js";

dotenv.config();

if (!process.env.SENTRY_DSN) {
  console.log("SENTRY_DSN not set — error monitoring disabled (fine for local dev only).");
}

const app = express();

// API responses never render HTML. These headers reduce browser-side attack
// surface when signed resume URLs or error responses are opened directly.
app.disable("x-powered-by");
app.use((req, res, next) => {
  const incomingRequestId = req.header("x-request-id");
  const requestId = incomingRequestId && /^[a-zA-Z0-9._:-]{1,128}$/.test(incomingRequestId) ? incomingRequestId : randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Fly.io sits directly in front of this app as a single proxy hop and sets
// X-Forwarded-For with the real client IP. Trusting exactly one hop (not an
// unbounded number) lets express-rate-limit read the real IP for the public
// demo limiter and the per-user limiters' IP fallback, without opening up
// the classic X-Forwarded-For spoofing risk that trusting arbitrary hops
// would.
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5174,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "resumematch-api", timestamp: new Date().toISOString() }));

app.get("/api/health/ready", async (req, res) => {
  const startedAt = Date.now();
  const dbCheck = supabase.from("organizations").select("id").limit(1);
  const timeout = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 3000));
  const result = await Promise.race([dbCheck, timeout]);
  if (result.timeout) {
    return res.status(503).json({
      ok: false,
      service: "resumematch-api",
      checks: { database: "timeout", email: process.env.RESEND_API_KEY ? "configured" : "not_configured" },
      latency_ms: Date.now() - startedAt,
      request_id: req.requestId,
    });
  }
  const { error } = result;
  if (error) return res.status(503).json({ ok: false, service: "resumematch-api", checks: { database: "down", email: process.env.RESEND_API_KEY ? "configured" : "not_configured" }, request_id: req.requestId });
  res.json({ ok: true, service: "resumematch-api", checks: { database: "up", email: process.env.RESEND_API_KEY ? "configured" : "not_configured" }, latency_ms: Date.now() - startedAt, timestamp: new Date().toISOString() });
});

app.use("/api", authRouter);
app.use("/api", publicRouter);
app.use("/api", openapiRouter);
app.use("/api", requireAuth, organizationsRouter);
app.use("/api", requireAuth, requireOrg, jobsRouter);
app.use("/api", requireAuth, requireOrg, candidatesRouter);
app.use("/api", requireAuth, taxonomyRouter);
app.use("/api", requireAuth, requireOrg, analyticsRouter);

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Request body contains invalid JSON." });
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "One or more files exceed the 10MB size limit." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files — max 100 per upload." });
    }
    return res.status(400).json({ error: err.message });
  }
  // Errors from a multer fileFilter (e.g. rejecting a non-resume file type)
  // aren't MulterError instances, but we tag them with .status so they still
  // surface as a clean 4xx instead of falling through to a generic 500.
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(`[${req.requestId || "unknown"}]`, err);
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      scope.setTag("request_id", req.requestId || "unknown");
      scope.setTag("route", req.route?.path || req.path || "unknown");
      Sentry.captureException(err);
    });
  }
  res.status(500).json({ error: "Internal server error", request_id: req.requestId });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`ResumeMatch API listening on port ${port}`);
  recoverStuckCandidates();
  scheduleRetentionSweep();
  // Fired after the port is already bound, so Fly's health check isn't
  // waiting on it — this can take a while on a cold machine.
  warmModels();
});

async function shutdown(signal) {
  console.log(`${signal} received; draining resume queue before shutdown.`);
  server.close();
  const drained = await waitForQueueIdle(15000);
  if (!drained) console.warn("Resume queue did not fully drain before shutdown; queued candidates will be recovered on restart.");
  process.exit(0);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
