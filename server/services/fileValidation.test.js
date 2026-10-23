import { describe, expect, it } from "vitest";
import { hasExpectedFileSignature } from "./fileValidation.js";

describe("resume file signature validation", () => {
  it("accepts a PDF header for .pdf files", () => {
    expect(hasExpectedFileSignature(Buffer.from("%PDF-1.7\nresume"), ".pdf")).toBe(true);
  });

  it("accepts a ZIP local-file header for .docx files", () => {
    expect(hasExpectedFileSignature(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14]), ".docx")).toBe(true);
  });

  it("accepts PNG and JPEG image signatures", () => {
    expect(hasExpectedFileSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ".png")).toBe(true);
    expect(hasExpectedFileSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), ".jpg")).toBe(true);
    expect(hasExpectedFileSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), ".jpeg")).toBe(true);
  });

  it("rejects spoofed extensions and unsupported types", () => {
    const text = Buffer.from("not a document");
    expect(hasExpectedFileSignature(text, ".pdf")).toBe(false);
    expect(hasExpectedFileSignature(text, ".docx")).toBe(false);
    expect(hasExpectedFileSignature(Buffer.from("%PDF-1.7"), ".txt")).toBe(false);
  });
});
