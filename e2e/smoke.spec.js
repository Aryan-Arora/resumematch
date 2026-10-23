import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const RESUME = join(here, "fixtures", "backend-engineer.docx");

const JD =
  "Senior Backend Engineer needed to build REST APIs with Node.js and PostgreSQL. " +
  "Experience with Docker, AWS and Kubernetes required. Python is a plus.";

function collectConsoleErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("homepage renders with its own title, canonical and structured data", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");
  await expect(page).toHaveTitle(/Explainable AI Resume Screening/);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://resumematch.co.in/");
  const types = await page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((e) => JSON.parse(e.textContent)["@type"])
  );
  expect(types).toEqual(expect.arrayContaining(["FAQPage", "Organization"]));
  expect(errors).toEqual([]);
});

test("a blog post renders with its own canonical and article schema", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/blog/how-resume-parsing-works");
  await expect(page.locator("h1")).toContainText("Resume Parsing");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://resumematch.co.in/blog/how-resume-parsing-works"
  );
  await expect(page.getByText("Post not found")).toHaveCount(0);
  const types = await page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((e) => JSON.parse(e.textContent)["@type"])
  );
  expect(types).toEqual(["Article", "BreadcrumbList"]);
  expect(errors).toEqual([]);
});

test("demo: paste a JD and detect domain and requirements", async ({ page }) => {
  await page.goto("/demo");
  await page.getByPlaceholder("Paste a job description here...").fill(JD);
  await page.getByRole("button", { name: "Detect skills" }).click();
  await expect(page.getByText("Detected domain")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/Extracted requirements \(\d+\)/)).toBeVisible();
  await expect(page.getByText("No specific requirements detected")).toHaveCount(0);
});

test("demo: upload a resume and see matched, implied and missing skills", async ({ page }) => {
  await page.goto("/demo");
  await page.getByPlaceholder("Paste a job description here...").fill(JD);
  await page.locator('input[type="file"]').setInputFiles(RESUME);
  await page.getByRole("button", { name: "Score resumes" }).click();
  await expect(page.getByText(/Matched \(\d+\)/)).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText(/Missing \(\d+\)/)).toBeVisible();
  await expect(page.getByText("backend-engineer.docx").first()).toBeVisible();
});

test("login page is reachable and shows the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
});

test("privacy request page renders a non-authenticated form", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/privacy-request");
  await expect(page).toHaveTitle(/Candidate privacy request/);
  await expect(page.getByRole("heading", { name: "Request data deletion" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit privacy request" })).toBeVisible();
  await expect(errors).toEqual([]);
});
