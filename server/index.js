import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import jobsRouter from "./routes/jobs.js";
import candidatesRouter from "./routes/candidates.js";
import taxonomyRouter from "./routes/taxonomy.js";
import analyticsRouter from "./routes/analytics.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

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
app.use("/api", requireAuth, jobsRouter);
app.use("/api", requireAuth, candidatesRouter);
app.use("/api", requireAuth, taxonomyRouter);
app.use("/api", requireAuth, analyticsRouter);

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
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`ResumeMatch API listening on port ${port}`);
  if (!process.env.APP_PASSWORD) {
    console.log("APP_PASSWORD not set — API auth is disabled (fine for local dev only).");
  }
});
