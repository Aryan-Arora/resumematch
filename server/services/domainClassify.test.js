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
      "engineering",
      "education",
      "legal",
      "creative_design",
      "manufacturing_production",
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

  it("classifies an engineering JD correctly", async () => {
    const jd = await getEmbedding(
      "Mechanical Engineer needed for structural analysis, SolidWorks CAD design, and " +
        "finite element analysis. PE license and Six Sigma experience preferred."
    );
    expect(await classifyDomain(jd)).toBe("engineering");
  }, 30000);

  it("classifies an education JD correctly", async () => {
    const jd = await getEmbedding(
      "Elementary School Teacher responsible for lesson planning, classroom management, " +
        "and student assessment. Teaching license and experience with Google Classroom required."
    );
    expect(await classifyDomain(jd)).toBe("education");
  }, 30000);

  it("classifies a legal JD correctly", async () => {
    const jd = await getEmbedding(
      "Corporate Paralegal supporting contract drafting, due diligence, and litigation " +
        "case management. Experience with Westlaw and Clio required."
    );
    expect(await classifyDomain(jd)).toBe("legal");
  }, 30000);

  it("classifies a creative/design JD correctly", async () => {
    const jd = await getEmbedding(
      "UX/UI Designer needed for wireframing, prototyping, and design systems work in " +
        "Figma. Strong typography and visual design skills required."
    );
    expect(await classifyDomain(jd)).toBe("creative_design");
  }, 30000);

  it("classifies a manufacturing/production JD correctly", async () => {
    const jd = await getEmbedding(
      "Production Line Supervisor overseeing CNC machine operation, quality control, and " +
        "lean manufacturing initiatives. Six Sigma and OSHA 30 preferred."
    );
    expect(await classifyDomain(jd)).toBe("manufacturing_production");
  }, 30000);
});
