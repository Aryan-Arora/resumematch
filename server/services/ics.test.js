import { describe, expect, it } from "vitest";
import { createInterviewIcs } from "./ics.js";

describe("createInterviewIcs", () => {
  it("creates an escaped UTC calendar event", () => {
    const ics = createInterviewIcs({ candidateName: "A, Candidate", jobTitle: "Backend; Engineer", start: "2026-10-25T10:00:00+05:30", end: "2026-10-25T10:30:00+05:30", location: "Meet, Room 1" });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20261025T043000Z");
    expect(ics).toContain("SUMMARY:Interview: Backend\\; Engineer");
    expect(ics).toContain("LOCATION:Meet\\, Room 1");
  });

  it("rejects an inverted time range", () => {
    expect(() => createInterviewIcs({ start: "2026-10-25T11:00:00Z", end: "2026-10-25T10:00:00Z" })).toThrow(/end must be after/);
  });
});
