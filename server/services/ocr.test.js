import { describe, expect, it } from "vitest";
import { shouldUseOcr } from "./ocr.js";

describe("OCR detection", () => {
  it("flags image-only documents", () => {
    expect(shouldUseOcr({ unparseable: true, confidence: 0, warnings: ["No text layer found"] })).toBe(true);
  });

  it("flags suspiciously short extraction", () => {
    expect(shouldUseOcr({ unparseable: false, confidence: 0.55, warnings: ["Very little text was extracted"] })).toBe(true);
  });

  it("keeps healthy text extraction on the normal path", () => {
    expect(shouldUseOcr({ unparseable: false, confidence: 0.95, warnings: [] })).toBe(false);
  });
});
