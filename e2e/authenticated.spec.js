import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const configured = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD && process.env.E2E_SUPABASE_URL && process.env.E2E_SUPABASE_ANON_KEY);
const apiBase = process.env.SMOKE_API_BASE_URL || "https://resumematch-api.fly.dev/api";

test.describe("authenticated recruiter flow", () => {
  test.skip(!configured, "Set E2E_EMAIL, E2E_PASSWORD, E2E_SUPABASE_URL, and E2E_SUPABASE_ANON_KEY to run against a dedicated test account.");

  test("creates, screens, reviews, exports, and cleans up a project", async ({ request }) => {
    const auth = createClient(process.env.E2E_SUPABASE_URL, process.env.E2E_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data, error } = await auth.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD });
    expect(error, error?.message).toBeNull();
    const token = data.session?.access_token;
    expect(token).toBeTruthy();
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    let jobId;
    try {
      const orgName = `E2E ${Date.now()}`;
      const organization = await request.post(`${apiBase}/organizations`, { headers, data: { name: orgName } });
      expect(organization.status()).toBe(201);

      const job = await request.post(`${apiBase}/jobs`, { headers, data: { title: "E2E screening role", description: "Backend engineer with JavaScript and at least 2 years experience.", requirement_config: { must_have: ["JavaScript"], minimum_years: 2 } } });
      expect(job.status()).toBe(201);
      jobId = (await job.json()).id;

      const resume = resolve(process.cwd(), "e2e/fixtures/backend-engineer.docx");
      const upload = await request.post(`${apiBase}/jobs/${jobId}/candidates`, { headers: { Authorization: `Bearer ${token}` }, multipart: { resumes: { name: "e2e-resume.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: readFileSync(resume) } } });
      expect(upload.status()).toBe(202);
      const uploaded = await upload.json();
      expect(uploaded.candidates.length).toBeGreaterThan(0);
      const candidateId = uploaded.candidates[0].id;

      await expect.poll(async () => {
        const status = await request.get(`${apiBase}/jobs/${jobId}/candidates/status`, { headers: { Authorization: `Bearer ${token}` } });
        const rows = await status.json();
        return rows.find((row) => row.id === candidateId)?.status;
      }, { timeout: 90_000 }).toBe("done");

      const reviewed = await request.patch(`${apiBase}/candidates/${candidateId}/review`, { headers, data: {} });
      expect(reviewed.status()).toBe(200);
      const workflow = await request.patch(`${apiBase}/candidates/${candidateId}/workflow`, { headers, data: { pipeline_stage: "screening", tags: ["e2e"] } });
      expect(workflow.status()).toBe(200);
      const exportResponse = await request.get(`${apiBase}/organizations/export`, { headers: { Authorization: `Bearer ${token}` } });
      expect(exportResponse.status()).toBe(200);
      expect((await exportResponse.json()).candidates.some((candidate) => candidate.id === candidateId)).toBeTruthy();
    } finally {
      if (jobId) {
        const cleanup = await request.delete(`${apiBase}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
        expect([204, 404]).toContain(cleanup.status());
      }
      await auth.auth.signOut();
    }
  });
});
