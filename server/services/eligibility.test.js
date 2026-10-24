import { describe, expect, it } from "vitest";
import { evaluateEligibility, extractRequiredFilters } from "./eligibility.js";

describe("eligibility gates", () => {
  it("extracts mandatory credentials and experience", () => {
    expect(extractRequiredFilters("Must have AWS certification and at least 5 years experience.")).toMatchObject({ minimum_years: 5 });
  });

  it("marks missing mandatory evidence for review instead of rejecting", () => {
    const result = evaluateEligibility({ certifications: ["must hold RN license"], minimum_years: null }, "Software engineer with 6 years experience");
    expect(result.status).toBe("needs_review");
    expect(result.reasons[0].type).toBe("unclear");
  });

  it("fails an explicit minimum-years gate", () => {
    expect(evaluateEligibility({ certifications: [], minimum_years: 5 }, "3 years experience").status).toBe("ineligible");
  });

  it("keeps missing structured location evidence in human review", () => {
    const result = evaluateEligibility({ locations: ["Bengaluru"], work_authorization: ["authorised to work in India"] }, "Software engineer based in Pune");
    expect(result.status).toBe("needs_review");
    expect(result.reasons.filter((reason) => reason.type === "unclear")).toHaveLength(2);
  });
});
