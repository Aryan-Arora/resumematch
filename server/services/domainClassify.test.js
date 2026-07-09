import { describe, it, expect } from "vitest";
import { getEmbedding } from "./embedding.js";
import { classifyDomain, getDomainList } from "./domainClassify.js";

describe("domainClassify", () => {
  it("lists the domains that skillTaxonomy.json defines, plus the general fallback", () => {
    expect(getDomainList()).toEqual([
      "tech",
      "service_delivery",
      "sales",
      "marketing",
      "finance_accounting",
      "hr_recruiting",
      "general",
    ]);
  });

  it("classifies a service-delivery JD correctly", async () => {
    const jd = await getEmbedding(
      "Service Delivery Leader responsible for SLA compliance, incident management, " +
        "escalation management, vendor management, ITIL v4, and ServiceNow administration."
    );
    expect(await classifyDomain(jd)).toBe("service_delivery");
  }, 30000);

  it("classifies a software engineering JD correctly", async () => {
    const jd = await getEmbedding(
      "Backend Engineer building microservices with Node.js, PostgreSQL, Docker, " +
        "Kubernetes, and AWS, with CI/CD pipelines."
    );
    expect(await classifyDomain(jd)).toBe("tech");
  }, 30000);

  it("classifies a sales JD correctly", async () => {
    const jd = await getEmbedding(
      "Account Executive owning the full sales pipeline: prospecting, cold calling, " +
        "contract negotiation, and quota attainment using Salesforce."
    );
    expect(await classifyDomain(jd)).toBe("sales");
  }, 30000);
});
