import { defineConfig } from "@playwright/test";

// Browser smoke test. Defaults to the live site; point it elsewhere with
// SMOKE_BASE_URL (e.g. a Vercel preview URL) before releasing a change.
export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.SMOKE_BASE_URL || "https://resumematch.co.in",
    trace: "retain-on-failure",
    // Marker the API uses to keep smoke-test runs out of demo_events.
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36 ResumeMatchSmokeTest",
  },
});
