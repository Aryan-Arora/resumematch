/**
 * OCR boundary for scanned resumes.
 * The default provider is deliberately disabled until OCR_PROVIDER and its
 * credentials are configured. This keeps uploads safe and makes the provider
 * swappable without changing the screening pipeline.
 */
export function shouldUseOcr(parsed) {
  return Boolean(parsed?.unparseable || parsed?.confidence < 0.6 || parsed?.warnings?.some((warning) => /no text|extraction failed/i.test(warning)));
}

export async function ocrResume() {
  if (!process.env.OCR_PROVIDER) {
    return {
      available: false,
      text: "",
      method: "ocr",
      confidence: 0,
      warnings: ["OCR is not configured. Upload a text-based PDF/DOCX or configure an OCR provider."],
    };
  }
  throw new Error(`OCR provider '${process.env.OCR_PROVIDER}' is not implemented yet.`);
}
