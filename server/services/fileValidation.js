export function hasExpectedFileSignature(buffer, ext) {
  if (!Buffer.isBuffer(buffer)) return false;
  if (ext === ".pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  // DOCX is an OOXML ZIP container.
  if (ext === ".docx") {
    return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }
  if (ext === ".png") {
    return buffer.length >= 8 && Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).equals(buffer.subarray(0, 8));
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  return false;
}
