import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv.js";

describe("parseCsv", () => {
  it("parses quoted commas and escaped quotes", () => {
    expect(parseCsv('Name,Email,Note\n"Doe, Jane",jane@example.com,"Said ""hello"""')).toEqual([
      { name: "Doe, Jane", email: "jane@example.com", note: 'Said "hello"' },
    ]);
  });

  it("normalizes headers and rejects duplicate headers or oversized imports", () => {
    expect(parseCsv("Full Name,Phone Number\nJane,123")).toEqual([{ full_name: "Jane", phone_number: "123" }]);
    expect(() => parseCsv("Name,Name\nA,B")).toThrow(/unique/);
    expect(() => parseCsv("Name\nA\nB", { maxRows: 1 })).toThrow(/row limit/);
  });

  it("rejects malformed quoting", () => {
    expect(() => parseCsv('Name,Note\nJane,"missing end')).toThrow(/unterminated/);
  });
});
