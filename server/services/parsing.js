import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[a-zA-Z0-9._-]+/i;
const URL_RE = /https?:\/\/[^\s<>()]+/gi;

// Resumes list a personal contact email once near the top, but skill lines
// like "email marketing" or a footer copyright address can also match a
// loose email pattern — taking the first hit in the raw text is what a human
// skimming the page would land on too.
export function extractEmail(text) {
  const match = text.match(EMAIL_RE);
  return match ? match[0] : null;
}

export function extractContactDetails(text) {
  const value = String(text || "");
  const phoneCandidates = value.match(PHONE_RE) || [];
  const phone = phoneCandidates
    .map((candidate) => candidate.replace(/\s+/g, " ").trim())
    .find((candidate) => candidate.replace(/\D/g, "").length >= 8 && candidate.replace(/\D/g, "").length <= 15) || null;
  const linkedinMatch = value.match(LINKEDIN_RE);
  const linkedinUrl = linkedinMatch ? `https://${linkedinMatch[0].replace(/^https?:\/\//i, "").replace(/^www\./i, "www.")}` : null;
  const urls = (value.match(URL_RE) || []).map((url) => url.replace(/[),.;]+$/, ""));
  const portfolioUrl = urls.find((url) => !/linkedin\.com\//i.test(url) && !/mailto:/i.test(url)) || null;
  return { phone, linkedinUrl, portfolioUrl };
}

export function normalizeResumeText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\t\f\r]+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function layoutWarnings(text) {
  const lines = text.split("\n");
  const warnings = [];
  const repeated = lines.length > 8 && lines.filter((line, index) => lines.indexOf(line) !== index).length > 2;
  if (repeated) warnings.push("Repeated headers or footers were detected; verify extracted sections.");
  if (lines.some((line) => line.length > 180)) warnings.push("Very long lines may indicate columns were read together.");
  return warnings;
}

export async function parsePdf(buffer) {
  try {
    const result = await pdfParse(buffer);
    const text = normalizeResumeText(result.text);
    if (!text) return { text: "", unparseable: true, needsOcr: true, method: "text", confidence: 0, warnings: ["No text layer found; OCR is required."] };
    const warnings = [...(text.length < 100 ? ["Very little text was extracted; verify this resume manually."] : []), ...layoutWarnings(text)];
    return { text, unparseable: false, needsOcr: text.length < 100, method: "text", confidence: warnings.length ? 0.75 : 0.95, warnings };
  } catch {
    return { text: "", unparseable: true, needsOcr: true, method: "text", confidence: 0, warnings: ["PDF text extraction failed; OCR is required."] };
  }
}

export async function parseDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = normalizeResumeText(result.value);
    if (!text) return { text: "", unparseable: true, needsOcr: true, method: "text", confidence: 0, warnings: ["No text could be extracted from this DOCX."] };
    const warnings = [...(text.length < 100 ? ["Very little text was extracted; verify this resume manually."] : []), ...layoutWarnings(text)];
    return { text, unparseable: false, needsOcr: text.length < 100, method: "text", confidence: warnings.length ? 0.75 : 0.95, warnings };
  } catch {
    return { text: "", unparseable: true, needsOcr: true, method: "text", confidence: 0, warnings: ["DOCX text extraction failed."] };
  }
}
