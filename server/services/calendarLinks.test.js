import { describe, expect, it } from "vitest";
import { createCalendarLinks } from "./calendarLinks.js";

describe("calendar links", () => {
  it("creates encoded Google and Outlook event links", () => {
    const links = createCalendarLinks({ title: "Interview — Ada", start: "2026-10-24T10:00:00Z", end: "2026-10-24T10:30:00Z", email: "ada@example.com" });
    expect(links.google).toContain("calendar.google.com");
    expect(links.google).toContain("Interview");
    expect(links.outlook).toContain("outlook.live.com");
  });
  it("rejects an inverted slot", () => {
    expect(() => createCalendarLinks({ title: "x", start: "2026-10-24T11:00:00Z", end: "2026-10-24T10:00:00Z" })).toThrow(/after/);
  });
});

