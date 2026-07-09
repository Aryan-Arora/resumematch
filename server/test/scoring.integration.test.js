import { describe, it, expect, beforeAll } from "vitest";
import { getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { classifyDomain } from "../services/domainClassify.js";
import { computeFinalScore } from "../services/scoring.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8"));

const JD = `
Service Delivery Leader

We are looking for a Service Delivery Leader to manage SLA compliance,
incident management, escalation management, and vendor management for our
IT operations team. Experience with ServiceNow and ITIL required. Strong KPI
reporting and stakeholder communication skills.
`;

const IT_SUPPORT_MANAGER_RESUME = `
Priya Nair
IT Support Manager

Managed SLA compliance and incident management for a 150-person helpdesk.
Owned escalation management and vendor management across ServiceNow.
ITIL v4 certified. Delivered weekly KPI reporting to senior stakeholders and
led root cause analysis for recurring incidents.
`;

const SOFTWARE_ENGINEER_RESUME = `
Alex Chen
Backend Software Engineer

Built and maintained microservices in Node.js and PostgreSQL. Used Docker,
Kubernetes, and AWS for deployment. Worked in an Agile team using Jira for
sprint tracking and GitHub Actions for CI/CD.
`;

async function scoreResume(jdEmbedding, jdSkills, jdDomain, resumeText) {
  const resumeEmbedding = await getEmbedding(resumeText);
  const semanticScore = cosineSimilarity(jdEmbedding, resumeEmbedding);
  const resumeSkills = extractSkills(resumeText, taxonomy[jdDomain]);
  const { matched } = compareSkills(jdSkills, resumeSkills);
  const skillScore = jdSkills.length > 0 ? matched.length / jdSkills.length : 0;
  return { finalScore: computeFinalScore(semanticScore, skillScore), matched };
}

describe("end-to-end scoring pipeline", () => {
  let jdEmbedding;
  let jdSkills;
  let jdDomain;

  beforeAll(async () => {
    jdEmbedding = await getEmbedding(JD);
    jdDomain = await classifyDomain(jdEmbedding);
    jdSkills = extractSkills(JD, taxonomy[jdDomain]);
  }, 30000);

  it("classifies the JD as service_delivery, not tech", () => {
    expect(jdDomain).toBe("service_delivery");
  });

  it("extracts the expected service-delivery skills from the JD", () => {
    expect(jdSkills).toEqual(
      expect.arrayContaining(["ITIL", "incident management", "escalation management", "ServiceNow"])
    );
  });

  it("ranks the IT Support Manager above the software engineer for this role", async () => {
    const [itSupport, engineer] = await Promise.all([
      scoreResume(jdEmbedding, jdSkills, jdDomain, IT_SUPPORT_MANAGER_RESUME),
      scoreResume(jdEmbedding, jdSkills, jdDomain, SOFTWARE_ENGINEER_RESUME),
    ]);

    expect(itSupport.finalScore).toBeGreaterThan(engineer.finalScore);
    expect(itSupport.matched.length).toBeGreaterThan(engineer.matched.length);
  }, 30000);
});
