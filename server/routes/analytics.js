import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

const SCORE_BUCKETS = [
  { label: "0.0-0.2", min: 0, max: 0.2 },
  { label: "0.2-0.4", min: 0.2, max: 0.4 },
  { label: "0.4-0.6", min: 0.4, max: 0.6 },
  { label: "0.6-0.8", min: 0.6, max: 0.8 },
  { label: "0.8-1.0", min: 0.8, max: 1.0001 },
];

router.get("/analytics", async (req, res) => {
  const { data: jobs, error: jobsError } = await supabase.from("jobs").select("id");
  if (jobsError) return res.status(500).json({ error: jobsError.message });

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("final_score, unparseable, matched_skills");
  if (candidatesError) return res.status(500).json({ error: candidatesError.message });

  const scored = candidates.filter((c) => !c.unparseable && c.final_score !== null);
  const totalCandidates = candidates.length;
  const unparseableCount = candidates.filter((c) => c.unparseable).length;
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, c) => sum + Number(c.final_score), 0) / scored.length
      : null;

  const scoreDistribution = SCORE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: scored.filter((c) => c.final_score >= bucket.min && c.final_score < bucket.max).length,
  }));

  const skillFrequency = new Map();
  for (const c of candidates) {
    for (const skill of c.matched_skills || []) {
      skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
    }
  }
  const topSkills = Array.from(skillFrequency.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json({
    totalJobs: jobs.length,
    totalCandidates,
    unparseableCount,
    avgScore,
    scoreDistribution,
    topSkills,
  });
});

export default router;
