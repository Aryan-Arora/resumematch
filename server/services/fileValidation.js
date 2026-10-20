export function hasExpectedFileSignature(buffer, ext) {
  if (!Buffer.isBuffer(buffer)) return false;
  if (ext === ".pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  // DOCX is an OOXML ZIP container.
  if (ext === ".docx") {
    return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }
  return false;
}
