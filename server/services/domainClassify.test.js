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
      "skilled_trades",
      "healthcare_support",
      "hospitality_food_service",
      "logistics_warehouse",
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

  it("classifies a skilled-trades JD correctly", async () => {
    const jd = await getEmbedding(
      "Licensed Electrician needed for residential wiring, panel upgrades, and code " +
        "compliance inspections. OSHA 30 and journeyman license required."
    );
    expect(await classifyDomain(jd)).toBe("skilled_trades");
  }, 30000);

  it("classifies a healthcare-support JD correctly", async () => {
    const jd = await getEmbedding(
      "Certified Nursing Assistant responsible for patient care, vital signs " +
        "monitoring, and mobility assistance in a skilled nursing facility. CNA and " +
        "CPR certification required."
    );
    expect(await classifyDomain(jd)).toBe("healthcare_support");
  }, 30000);

  it("classifies a hospitality/food-service JD correctly", async () => {
    const jd = await getEmbedding(
      "Restaurant Server handling table service, guest relations, and point of sale " +
        "operations in a fast-paced dining room. ServSafe certification preferred."
    );
    expect(await classifyDomain(jd)).toBe("hospitality_food_service");
  }, 30000);

  it("classifies a logistics/warehouse JD correctly", async () => {
    const jd = await getEmbedding(
      "Warehouse Associate responsible for order fulfillment, forklift operation, and " +
        "inventory management using a warehouse management system. Forklift " +
        "certification required."
    );
    expect(await classifyDomain(jd)).toBe("logistics_warehouse");
  }, 30000);
});
