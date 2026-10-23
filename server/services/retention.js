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
  if (jobsError || organizationsError) {
    console.error("Retention sweep could not load cleanup inputs", { jobs: jobsError?.message || null, organizations: organizationsError?.message || null });
    return { expired: 0, deleted: 0, failed: 1 };
  }
  const retentionByOrg = new Map((organizations || []).map((org) => [org.id, Number(org.retention_days) || fallbackDays]));
  const now = Date.now();
  const expiredJobs = (jobs || []).filter((job) => {
    const days = retentionByOrg.get(job.org_id) || fallbackDays;
    return new Date(job.created_at).getTime() < now - days * 24 * 60 * 60 * 1000;
  });
  if (expiredJobs.length === 0) return { expired: 0, deleted: 0, failed: 0 };

  console.log(`Retention sweep: deleting ${expiredJobs.length} job(s) past their organization retention limit...`);
  let deleted = 0;
  let failed = 0;
  for (const job of expiredJobs) {
    try {
      if (await deleteJobCascade(job)) deleted += 1;
      else failed += 1;
    } catch (error) {
      failed += 1;
      console.error(`Retention sweep failed for job ${job.id}`, error);
    }
  }
  console.log("Retention sweep complete", { expired: expiredJobs.length, deleted, failed });
  return { expired: expiredJobs.length, deleted, failed };
}

export function scheduleRetentionSweep() {
  runRetentionSweep();
  setInterval(runRetentionSweep, SWEEP_INTERVAL_MS);
}
