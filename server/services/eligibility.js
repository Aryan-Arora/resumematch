const CERTIFICATION_RE = /(?:required|must have|must hold|mandatory)[^\n.;]{0,100}\b(certifi(?:cation|ed)|license|licen[cs]e)\b[^\n.;]{0,120}/gi;
const YEARS_RE = /(?:minimum|min\.?|at least)\s+(\d+)\+?\s+years?[^\n.;]{0,80}/gi;

function normalise(value) {
  return value.replace(/\s+/g, " ").trim();
}

export function extractRequiredFilters(description) {
  const text = String(description || "");
  const certifications = [...text.matchAll(CERTIFICATION_RE)].map((m) => normalise(m[0]));
  const years = [...text.matchAll(YEARS_RE)].map((m) => Number(m[1])).filter(Number.isFinite);
  return {
    certifications: [...new Set(certifications)].slice(0, 12),
    minimum_years: years.length ? Math.max(...years) : null,
  };
}

export function evaluateEligibility(filters, resumeText) {
  const text = String(resumeText || "");
  if (!text.trim()) return { status: "needs_review", reasons: ["Resume text is unavailable."] };

  const reasons = [];
  let hasUnclear = false;
  for (const requirement of filters?.certifications || []) {
    const tokens = requirement.toLowerCase().split(/[^a-z0-9+#]+/).filter((token) => token.length > 2);
    if (tokens.length && tokens.every((token) => text.toLowerCase().includes(token))) {
      reasons.push({ type: "passed", text: `Required credential evidence found: ${requirement}` });
    } else {
      reasons.push({ type: "unclear", text: `Verify required credential: ${requirement}` });
      hasUnclear = true;
    }
  }
  if (filters?.minimum_years) {
    const yearsMatch = text.match(/(\d+)\+?\s+years?/i);
    const years = yearsMatch ? Number(yearsMatch[1]) : null;
    if (years === null) {
      reasons.push({ type: "unclear", text: `Verify at least ${filters.minimum_years} years of experience.` });
      hasUnclear = true;
    } else if (years < filters.minimum_years) {
      reasons.push({ type: "failed", text: `Resume states ${years} years; ${filters.minimum_years} required.` });
      return { status: "ineligible", reasons };
    } else {
      reasons.push({ type: "passed", text: `Experience requirement met (${years} years stated).` });
    }
  }
  return { status: hasUnclear ? "needs_review" : "eligible", reasons };
}
