import { supabase } from "../supabaseClient.js";
import { deleteJobCascade } from "../routes/jobs.js";

const RETENTION_DAYS = 180;
const SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000; // once a day

// Automated enforcement of docs/DATA_RETENTION.md: jobs older than 180 days
// are deleted along with their non-starred candidates. Starred candidates are
// preserved (see deleteJobCascade) since starring is meant to survive
// automated cleanup, not just manual job deletion.
export async function runRetentionSweep() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: expiredJobs, error } = await supabase
    .from("jobs")
    .select("id, title")
    .lt("created_at", cutoff);
  if (error || !expiredJobs || expiredJobs.length === 0) return;

  console.log(`Retention sweep: deleting ${expiredJobs.length} job(s) past the ${RETENTION_DAYS}-day limit...`);
  for (const job of expiredJobs) {
    await deleteJobCascade(job);
  }
}

export function scheduleRetentionSweep() {
  runRetentionSweep();
  setInterval(runRetentionSweep, SWEEP_INTERVAL_MS);
}
