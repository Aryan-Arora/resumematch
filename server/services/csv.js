const MAX_ROWS = 1000;
const MAX_CELL_LENGTH = 5000;

function parseLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell.trim()); cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  cells.push(cell.trim());
  return cells;
}

export function parseCsv(input, { maxRows = MAX_ROWS } = {}) {
  const text = String(input || "").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];
  const headers = parseLine(lines[0]).map((header) => header.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
  if (!headers.length || headers.some((header) => !header)) throw new Error("CSV must include a header row");
  if (new Set(headers).size !== headers.length) throw new Error("CSV headers must be unique");
  if (lines.length - 1 > maxRows) throw new Error(`CSV exceeds the ${maxRows}-row limit`);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    if (values.some((value) => value.length > MAX_CELL_LENGTH)) throw new Error("CSV cell exceeds the 5,000-character limit");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}
