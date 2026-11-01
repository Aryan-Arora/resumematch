// Our own browser smoke test identifies itself in the user agent so its runs
// don't inflate demo counts.
export function isInternalTestTraffic(userAgent) {
  return typeof userAgent === "string" && userAgent.includes("ResumeMatchSmokeTest");
}
