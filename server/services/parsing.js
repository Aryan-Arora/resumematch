import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// Resumes list a personal contact email once near the top, but skill lines
// like "email marketing" or a footer copyright address can also match a
// loose email pattern — taking the first hit in the raw text is what a human
// skimming the page would land on too.
export function extractEmail(text) {
  const match = text.match(EMAIL_RE);
  return match ? match[0] : null;
}

export async function parsePdf(buffer) {
  try {
    const result = await pdfParse(buffer);
    const text = result.text.trim();
    if (!text) return { text: "", unparseable: true };
    return { text, unparseable: false };
  } catch {
    return { text: "", unparseable: true };
  }
}

export async function parseDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    if (!text) return { text: "", unparseable: true };
    return { text, unparseable: false };
  } catch {
    return { text: "", unparseable: true };
  }
}
