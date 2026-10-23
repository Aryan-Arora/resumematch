import { afterEach, describe, expect, it } from "vitest";
import { getDeletionSlaDays, getDeletionSlaDueAt, isDeletionRequestOverdue } from "./deletionSla.js";

const original = process.env.DELETION_SLA_DAYS;
afterEach(() => { if (original === undefined) delete process.env.DELETION_SLA_DAYS; else process.env.DELETION_SLA_DAYS = original; });

describe("deletion SLA", () => {
  it("clamps the operational setting", () => {
    expect(getDeletionSlaDays("0")).toBe(1);
    expect(getDeletionSlaDays("999")).toBe(365);
    expect(getDeletionSlaDays("nope")).toBe(30);
  });
  it("calculates due dates and overdue state", () => {
    const created = "2026-01-01T00:00:00.000Z";
    expect(getDeletionSlaDueAt(created, 30)).toBe("2026-01-31T00:00:00.000Z");
    expect(isDeletionRequestOverdue(created, "pending", new Date("2026-02-01T00:00:00.000Z"))).toBe(true);
    expect(isDeletionRequestOverdue(created, "resolved", new Date("2026-02-01T00:00:00.000Z"))).toBe(false);
  });
});
