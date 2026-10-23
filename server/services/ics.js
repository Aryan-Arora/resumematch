function escapeText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatUtc(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("invalid date");
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function createInterviewIcs({ candidateName, jobTitle, start, end, location = "", description = "" }) {
  const startUtc = formatUtc(start);
  const endUtc = formatUtc(end);
  if (new Date(end).getTime() <= new Date(start).getTime()) throw new Error("end must be after start");
  const uid = `${startUtc}-${endUtc}-${Math.random().toString(36).slice(2)}@resumematch`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ResumeMatch//Interview//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeText(`Interview: ${jobTitle || "Role"}`)}`,
    `DESCRIPTION:${escapeText(description || `Interview with ${candidateName || "candidate"}`)}`,
    location ? `LOCATION:${escapeText(location)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n") + "\r\n";
}
