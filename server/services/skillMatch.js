import { findImpliedRequirements } from "./semanticSkillMatch.js";

export function flattenTaxonomy(taxonomy) {
  return Object.values(taxonomy).flat();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractSkills(text, taxonomy) {
  const allSkills = flattenTaxonomy(taxonomy);
  const matched = [];
  for (const skill of allSkills) {
    const pattern = new RegExp(`(?<![\\w+#.])${escapeRegex(skill)}(?![\\w+#])`, "i");
    if (pattern.test(text)) matched.push(skill);
  }
  return matched;
}

// JD-side requirement extraction: literal match first (cheap, exact), then
// falls back to semantic matching (via findImpliedRequirements) for any
// taxonomy skill the JD implies but doesn't name verbatim — e.g. "version
// control systems" implying Git, "RESTful API design" implying REST APIs.
// Resume-side extraction stays literal-only here; its own semantic pass
// (findImpliedSkills) already runs separately in the callers below.
export async function extractSkillsWithSemanticFallback(text, taxonomy, skillEmbeddingCache) {
  const literal = extractSkills(text, taxonomy);
  const implied = await findImpliedRequirements(text, flattenTaxonomy(taxonomy), literal, skillEmbeddingCache);
  return [...literal, ...implied];
}

export function compareSkills(jdSkills, resumeSkills) {
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const matched = jdSkills.filter((s) => resumeSet.has(s.toLowerCase()));
  const missing = jdSkills.filter((s) => !resumeSet.has(s.toLowerCase()));
  return { matched, missing };
}
