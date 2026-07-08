function flattenTaxonomy(taxonomy) {
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

export function compareSkills(jdSkills, resumeSkills) {
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const matched = jdSkills.filter((s) => resumeSet.has(s.toLowerCase()));
  const missing = jdSkills.filter((s) => !resumeSet.has(s.toLowerCase()));
  return { matched, missing };
}
