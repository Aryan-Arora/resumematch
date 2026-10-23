import { supabase } from "../supabaseClient.js";
import { deleteJobCascade } from "../routes/jobs.js";
import { getRetentionDays } from "./retentionConfig.js";
const SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000; // once a day

// Automated enforcement of docs/DATA_RETENTION.md: jobs older than 180 days
// are deleted along with their non-starred candidates. Starred candidates are
// preserved (see deleteJobCascade) since starring is meant to survive
// automated cleanup, not just manual job deletion.
export async function runRetentionSweep() {
  const fallbackDays = getRetentionDays();
  const [{ data: jobs, error: jobsError }, { data: organizations, error: organizationsError }] = await Promise.all([
    supabase.from("jobs").select("id, title, org_id, created_at"),
    supabase.from("organizations").select("id, retention_days"),
  ]);
  if (jobsError || organizationsError) return;
  const retentionByOrg = new Map((organizations || []).map((org) => [org.id, Number(org.retention_days) || fallbackDays]));
  const now = Date.now();
  const expiredJobs = (jobs || []).filter((job) => {
    const days = retentionByOrg.get(job.org_id) || fallbackDays;
    return new Date(job.created_at).getTime() < now - days * 24 * 60 * 60 * 1000;
  });
  if (expiredJobs.length === 0) return;

  console.log(`Retention sweep: deleting ${expiredJobs.length} job(s) past their organization retention limit...`);
  for (const job of expiredJobs) {
    await deleteJobCascade(job);
  }
}

export function scheduleRetentionSweep() {
  runRetentionSweep();
  setInterval(runRetentionSweep, SWEEP_INTERVAL_MS);
}
