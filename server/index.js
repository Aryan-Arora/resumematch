import express from "express";
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
import { requireAuth, requireOrg } from "./middleware/auth.js";
import { scheduleRetentionSweep } from "./services/retention.js";

dotenv.config();

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  console.log("Sentry error monitoring enabled.");
} else {
  console.log("SENTRY_DSN not set — error monitoring disabled (fine for local dev only).");
}

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5174,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api", authRouter);
app.use("/api", publicRouter);
app.use("/api", requireAuth, organizationsRouter);
app.use("/api", requireAuth, requireOrg, jobsRouter);
app.use("/api", requireAuth, requireOrg, candidatesRouter);
app.use("/api", requireAuth, taxonomyRouter);
app.use("/api", requireAuth, requireOrg, analyticsRouter);

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "One or more files exceed the 10MB size limit." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files — max 100 per upload." });
    }
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  if (process.env.SENTRY_DSN) Sentry.captureException(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", () => {
  console.log(`ResumeMatch API listening on port ${port}`);
  recoverStuckCandidates();
  scheduleRetentionSweep();
});
