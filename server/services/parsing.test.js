import { describe, it, expect } from "vitest";
import { extractEmail } from "./parsing.js";

describe("extractEmail", () => {
  it("finds an email address in resume text", () => {
    expect(extractEmail("Jordan Lee\njordan.lee@example.com\n(555) 123-4567")).toBe(
      "jordan.lee@example.com"
    );
  });

  it("returns the first email when the resume mentions more than one", () => {
    expect(extractEmail("Contact: a@example.com or b@example.com")).toBe("a@example.com");
  });

  it("returns null when no email is present", () => {
    expect(extractEmail("Jordan Lee, Senior Engineer, 8 years experience")).toBeNull();
  });
});
