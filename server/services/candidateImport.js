const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https:\/\//i;

const aliases = {
  name: "full_name",
  candidate_name: "full_name",
  contact_email: "email",
  phone_number: "phone",
  linkedin: "linkedin_url",
  linkedin_profile: "linkedin_url",
  portfolio: "portfolio_url",
  notes: "recruiter_notes",
};

function clean(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

export function normalizeImportRows(rows) {
  const seen = new Set();
  const imported = [];
  const failures = [];
  rows.forEach((raw, index) => {
    const rowNumber = index + 2;
    const row = Object.fromEntries(Object.entries(raw).map(([key, value]) => [aliases[key] || key, value]));
    const email = clean(row.email, 320).toLowerCase();
    const fullName = clean(row.full_name, 240);
    const phone = clean(row.phone, 80);
    const linkedinUrl = clean(row.linkedin_url, 500);
    const portfolioUrl = clean(row.portfolio_url, 500);
    const recruiterNotes = clean(row.recruiter_notes, 5000);
    const sourceFile = clean(row.file_name, 255);
    if (!fullName && !email && !sourceFile) {
      failures.push({ row: rowNumber, error: "name, email, or file_name is required" });
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      failures.push({ row: rowNumber, error: "email is invalid" });
      return;
    }
    if (linkedinUrl && !URL_RE.test(linkedinUrl)) {
      failures.push({ row: rowNumber, error: "linkedin_url must use https://" });
      return;
    }
    if (portfolioUrl && !URL_RE.test(portfolioUrl)) {
      failures.push({ row: rowNumber, error: "portfolio_url must use https://" });
      return;
    }
    if (email && seen.has(email)) {
      failures.push({ row: rowNumber, error: "duplicate email in import" });
      return;
    }
    if (email) seen.add(email);
    imported.push({
      rowNumber,
      email: email || null,
      phone: phone || null,
      linkedin_url: linkedinUrl || null,
      portfolio_url: portfolioUrl || null,
      recruiter_notes: recruiterNotes,
      file_name: sourceFile || fullName || email || `Imported candidate ${rowNumber - 1}`,
    });
  });
  return { imported, failures };
}

