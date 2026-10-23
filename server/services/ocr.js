/**
 * OCR boundary for scanned resumes. The local provider is optional: if its
 * native dependencies are unavailable, callers receive a structured warning
 * and can route the candidate to human review instead of failing the worker.
 */
export function shouldUseOcr(parsed) {
  return Boolean(parsed?.unparseable || parsed?.confidence < 0.6 || parsed?.warnings?.some((warning) => /no text|extraction failed/i.test(warning)));
}
export async function ocrResume(buffer, { fileName = "resume.pdf" } = {}) {
  const provider = process.env.OCR_PROVIDER || "local-tesseract";
  if (provider === "none") {
    return {
      available: false,
      text: "",
      method: "ocr",
      confidence: 0,
      warnings: ["OCR is disabled. Upload a text-based PDF/DOCX or enable OCR_PROVIDER."],
    };
  }
  if (provider !== "local-tesseract") throw new Error(`OCR provider '${provider}' is not implemented yet.`);
  if (!/\.pdf$/i.test(fileName)) {
    return {
      available: false,
      text: "",
      method: "ocr",
      confidence: 0,
      warnings: ["OCR currently supports image-only PDF resumes; verify this document manually."],
    };
  }

  const workdir = await mkdtemp(join(tmpdir(), "resumematch-ocr-"));
  const source = join(workdir, fileName.replace(/[^a-z0-9._-]/gi, "_").slice(-80));
  try {
    await writeFile(source, buffer);
    const input = join(workdir, "page");
    try {
      await execFileAsync("pdftoppm", ["-png", "-r", "180", source, input], { timeout: 30000 });
    } catch (error) {
      return {
        available: false,
        text: "",
        method: "ocr",
        confidence: 0,
        warnings: [`OCR could not convert this PDF (${error.code === "ENOENT" ? "PDF tools are unavailable" : "conversion failed"}).`],
      };
    }
    const images = (await readdir(workdir)).filter((name) => name.startsWith("page-") && name.endsWith(".png")).sort().map((name) => join(workdir, name));
    const textParts = [];
    for (const image of images.slice(0, 20)) {
      try {
        const result = await execFileAsync("tesseract", [image, "stdout", "-l", process.env.OCR_LANGUAGE || "eng"], { timeout: 30000, maxBuffer: 2 * 1024 * 1024 });
        if (result.stdout.trim()) textParts.push(result.stdout.trim());
      } catch (error) {
        return {
          available: false,
          text: "",
          method: "ocr",
          confidence: 0,
          warnings: [`OCR could not read this PDF (${error.code === "ENOENT" ? "Tesseract is unavailable" : "recognition failed"}).`],
        };
      }
    }
    const text = textParts.join("\n\n").trim();
    return { available: true, text, method: "ocr", confidence: text.length >= 100 ? 0.78 : 0.35, warnings: text ? [] : ["OCR returned no readable text."] };
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}
import { mkdtemp, writeFile, readdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
