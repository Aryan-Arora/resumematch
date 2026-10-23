import { describe, expect, it } from "vitest";
import { normalizeImportRows } from "./candidateImport.js";

describe("normalizeImportRows", () => {
  it("normalizes aliases and preserves recruiter metadata", () => {
    const result = normalizeImportRows([{ candidate_name: "Ada Lovelace", contact_email: "ADA@example.com", linkedin: "https://linkedin.com/in/ada", notes: "Strong match" }]);
    expect(result.failures).toEqual([]);
    expect(result.imported[0]).toMatchObject({ file_name: "Ada Lovelace", email: "ada@example.com", linkedin_url: "https://linkedin.com/in/ada", recruiter_notes: "Strong match" });
  });

  it("rejects invalid URLs and duplicate emails", () => {
    const invalidUrl = normalizeImportRows([{ email: "a@example.com", portfolio: "http://example.com" }]);
    expect(invalidUrl.imported).toHaveLength(0);
    expect(invalidUrl.failures[0].error).toBe("portfolio_url must use https://");
    const duplicate = normalizeImportRows([{ email: "a@example.com" }, { email: "A@example.com" }]);
    expect(duplicate.imported).toHaveLength(1);
    expect(duplicate.failures[0].error).toBe("duplicate email in import");
  });
});

