export const DEFAULT_DELETION_SLA_DAYS = 30;
export const MIN_DELETION_SLA_DAYS = 1;
export const MAX_DELETION_SLA_DAYS = 365;

export function getDeletionSlaDays(value = process.env.DELETION_SLA_DAYS) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_DELETION_SLA_DAYS;
  return Math.min(MAX_DELETION_SLA_DAYS, Math.max(MIN_DELETION_SLA_DAYS, parsed));
}

export function getDeletionSlaDueAt(createdAt, days = getDeletionSlaDays()) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  created.setUTCDate(created.getUTCDate() + days);
  return created.toISOString();
}

export function isDeletionRequestOverdue(createdAt, status, now = new Date()) {
  if (status !== "pending") return false;
  const dueAt = getDeletionSlaDueAt(createdAt);
  return Boolean(dueAt && new Date(now).getTime() >= new Date(dueAt).getTime());
}
