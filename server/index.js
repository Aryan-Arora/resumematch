import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobsRouter from "./routes/jobs.js";
import candidatesRouter from "./routes/candidates.js";
import taxonomyRouter from "./routes/taxonomy.js";
import analyticsRouter from "./routes/analytics.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", jobsRouter);
app.use("/api", candidatesRouter);
app.use("/api", taxonomyRouter);
app.use("/api", analyticsRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`ResumeMatch API listening on port ${port}`);
});
