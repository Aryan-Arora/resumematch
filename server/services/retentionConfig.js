export const DEFAULT_RETENTION_DAYS = 180;
export const MIN_RETENTION_DAYS = 30;
export const MAX_RETENTION_DAYS = 3650;

export function getRetentionDays(value = process.env.RETENTION_DAYS) {
  const configured = Number.parseInt(value || "", 10);
  if (!Number.isFinite(configured)) return DEFAULT_RETENTION_DAYS;
  return Math.min(MAX_RETENTION_DAYS, Math.max(MIN_RETENTION_DAYS, configured));
}
