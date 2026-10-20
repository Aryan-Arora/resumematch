import { describe, it, expect } from "vitest";
import { extractEmail, extractContactDetails, normalizeResumeText } from "./parsing.js";

describe("extractEmail", () => {
  it("finds an email address in resume text", () => {
    expect(extractEmail("Jordan Lee\njordan.lee@example.com\n(555) 123-4567")).toBe(
      "jordan.lee@example.com"
    );
  });

  it("returns the first email when the resume mentions more than one", () => {
    expect(extractEmail("Contact: a@example.com or b@example.com")).toBe("a@example.com");
  });

  it("normalizes email casing", () => {
    expect(extractEmail("Contact: Jordan.LEE@Example.COM")).toBe("jordan.lee@example.com");
  });

  it("returns null when no email is present", () => {
    expect(extractEmail("Jordan Lee, Senior Engineer, 8 years experience")).toBeNull();
  });
});

describe("normalizeResumeText", () => {
  it("removes layout whitespace while preserving section lines", () => {
    expect(normalizeResumeText("  Jordan  Lee\r\n\r\nSkills:\tJavaScript  ")).toBe("Jordan Lee\nSkills: JavaScript");
  });
});

describe("extractContactDetails", () => {
  it("extracts phone, LinkedIn, and portfolio URLs", () => {
    expect(extractContactDetails("Jordan Lee\n+1 (555) 123-4567\nlinkedin.com/in/jordan-lee\nhttps://jordanlee.dev"))
      .toEqual({ phone: "+1 (555) 123-4567", linkedinUrl: "https://linkedin.com/in/jordan-lee", portfolioUrl: "https://jordanlee.dev" });
  });

  it("does not treat an email or LinkedIn URL as a portfolio", () => {
    expect(extractContactDetails("jordan@example.com linkedin.com/in/jordan")).toEqual({ phone: null, linkedinUrl: "https://linkedin.com/in/jordan", portfolioUrl: null });
  });
});
