import { describe, expect, it } from "vitest";
import { ocrResume, shouldUseOcr } from "./ocr.js";
import { parseImage } from "./parsing.js";

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

  it("does not send DOCX binaries to the image OCR provider", async () => {
    const result = await ocrResume(Buffer.from("not an image"), { fileName: "resume.docx" });
    expect(result.available).toBe(false);
    expect(result.warnings[0]).toMatch(/scanned PDF, PNG, and JPEG/i);
  });

  it("accepts image resumes at the OCR boundary", async () => {
    const result = await ocrResume(Buffer.from("not an image"), { fileName: "resume.png" });
    expect(result.available).toBe(false);
    expect(result.warnings[0]).toMatch(/Tesseract|recognition/i);
  });

  it("gives image OCR failures an explicit parse shape", () => {
    expect(parseImage()).toMatchObject({
      unparseable: true,
      needsOcr: true,
      method: "text",
      confidence: 0,
    });
  });

  it("turns an unsupported OCR provider into a review warning", async () => {
    const previous = process.env.OCR_PROVIDER;
    process.env.OCR_PROVIDER = "unsupported-provider";
    try {
      const result = await ocrResume(Buffer.from("resume"), { fileName: "resume.png" });
      expect(result.available).toBe(false);
      expect(result.warnings[0]).toMatch(/not available|manual review/i);
    } finally {
      if (previous === undefined) delete process.env.OCR_PROVIDER;
      else process.env.OCR_PROVIDER = previous;
    }
  });
});
