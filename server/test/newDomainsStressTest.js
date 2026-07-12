// Validates the 4 newly-added curated taxonomies (skilled_trades,
// healthcare_support, hospitality_food_service, logistics_warehouse) the
// same way the original 50-domain stress test validated the general
// fallback: each domain's real resume must outrank an adjacent-but-wrong
// resume from one of the other new domains.
//
// Run: node server/test/newDomainsStressTest.js

import { getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { classifyDomain } from "../services/domainClassify.js";
import { findImpliedSkills } from "../services/semanticSkillMatch.js";
import { computeFinalScore } from "../services/scoring.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { NEW_DOMAINS } from "./fixtures/newDomainsStressData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8"));

function buildJD(domain) {
  return `${domain.title}\n\nWe need someone experienced in ${domain.phrases.join(", ")}. Strong background as a ${domain.title.toLowerCase()} required.`;
}

async function scoreResume(jdEmbedding, jdSkills, jdDomain, resumeText) {
  const resumeEmbedding = await getEmbedding(resumeText);
  const semanticScore = cosineSimilarity(jdEmbedding, resumeEmbedding);
  const resumeSkills = extractSkills(resumeText, taxonomy[jdDomain]);
  const { matched, missing } = compareSkills(jdSkills, resumeSkills);
  const { impliedSkills } = await findImpliedSkills(missing, resumeText, new Map());
  const skillScore = jdSkills.length > 0 ? (matched.length + impliedSkills.length) / jdSkills.length : 0;
  return { finalScore: computeFinalScore(semanticScore, skillScore), matched: matched.length, implied: impliedSkills.length, total: jdSkills.length };
}

async function run() {
  const results = [];
  for (let i = 0; i < NEW_DOMAINS.length; i++) {
    const domain = NEW_DOMAINS[i];
    const wrongDomain = NEW_DOMAINS[(i + 1) % NEW_DOMAINS.length];

    const jdText = buildJD(domain);
    const jdEmbedding = await getEmbedding(jdText);
    const classifiedDomain = await classifyDomain(jdEmbedding);
    const jdSkills = extractSkills(jdText, taxonomy[classifiedDomain]);

    const [correct, wrong] = await Promise.all([
      scoreResume(jdEmbedding, jdSkills, classifiedDomain, domain.resume),
      scoreResume(jdEmbedding, jdSkills, classifiedDomain, wrongDomain.resume),
    ]);

    const pass = correct.finalScore > wrong.finalScore;
    results.push({
      title: domain.title,
      classifiedDomain,
      pass,
      correctScore: correct.finalScore,
      wrongScore: wrong.finalScore,
      coverage: `${correct.matched + correct.implied}/${correct.total}`,
      vs: wrongDomain.title,
    });
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${domain.title.padEnd(28)} domain=${classifiedDomain.padEnd(24)} correct=${correct.finalScore} wrong=${wrong.finalScore}  coverage=${results[i].coverage}  vs="${wrongDomain.title}"`
    );
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} passed ranking check.`);
}

run();
