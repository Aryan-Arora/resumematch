import pdfParse from "pdf-parse";
import mammoth from "mammoth";

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
