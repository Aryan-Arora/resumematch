// Standalone report script (not a vitest suite) — validates the "general"
// domain fallback (keyphraseExtract.js + KEYPHRASE_MATCH_THRESHOLD) across
// 50 job domains with zero overlap with the 6 curated taxonomies.
//
// For each domain: build a JD from its phrase list, score its own strong-fit
// resume against a "wrong domain" resume (the next domain's strong-fit
// resume, rotated) using the exact same pipeline code as the real API route.
// A domain "passes" if the correct resume scores higher.
//
// Run: node server/test/domainStressTest.js

import { getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { classifyDomain } from "../services/domainClassify.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";
import { findImpliedSkills, KEYPHRASE_MATCH_THRESHOLD } from "../services/semanticSkillMatch.js";
import { computeFinalScore } from "../services/scoring.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { DOMAINS } from "./fixtures/domainStressData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8"));

function buildJD(domain) {
  return `${domain.title}\n\nWe need someone experienced in ${domain.phrases.join(", ")}. Strong background as a ${domain.title.toLowerCase()} required.`;
}

async function classifyAndExtract(jdText) {
  const jdEmbedding = await getEmbedding(jdText);
  const candidateDomain = await classifyDomain(jdEmbedding);
  const candidateSkills = extractSkills(jdText, taxonomy[candidateDomain]);
  if (candidateSkills.length === 0) {
    return {
      jdEmbedding,
      jdDomain: "general",
      jdSkills: extractKeyphrases(jdText, { minWordsPerPhrase: 2 }),
      misclassifiedInto: null,
    };
  }
  return {
    jdEmbedding,
    jdDomain: candidateDomain,
    jdSkills: candidateSkills,
    misclassifiedInto: candidateDomain,
  };
}

async function scoreResume(jdEmbedding, jdSkills, jdDomain, resumeText) {
  const resumeEmbedding = await getEmbedding(resumeText);
  const semanticScore = cosineSimilarity(jdEmbedding, resumeEmbedding);
  const taxonomyArg = jdDomain === "general" ? { keyphrases: jdSkills } : taxonomy[jdDomain];
  const resumeSkills = extractSkills(resumeText, taxonomyArg);
  const { matched, missing } = compareSkills(jdSkills, resumeSkills);
  const { impliedSkills } = await findImpliedSkills(missing, resumeText, new Map(), {
    threshold: jdDomain === "general" ? KEYPHRASE_MATCH_THRESHOLD : undefined,
  });
  const skillScore = jdSkills.length > 0 ? (matched.length + impliedSkills.length) / jdSkills.length : 0;
  return {
    finalScore: computeFinalScore(semanticScore, skillScore),
    matchedCount: matched.length,
    impliedCount: impliedSkills.length,
    totalSkills: jdSkills.length,
  };
}

async function run() {
  const results = [];
  let misclassified = 0;

  for (let i = 0; i < DOMAINS.length; i++) {
    const domain = DOMAINS[i];
    const wrongDomain = DOMAINS[(i + 1) % DOMAINS.length];

    const jdText = buildJD(domain);
    const { jdEmbedding, jdDomain, jdSkills, misclassifiedInto } = await classifyAndExtract(jdText);
    if (misclassifiedInto) misclassified++;

    const [correct, wrong] = await Promise.all([
      scoreResume(jdEmbedding, jdSkills, jdDomain, domain.resume),
      scoreResume(jdEmbedding, jdSkills, jdDomain, wrongDomain.resume),
    ]);

    const pass = correct.finalScore > wrong.finalScore;
    results.push({
      title: domain.title,
      jdDomain,
      misclassifiedInto,
      pass,
      correctScore: correct.finalScore,
      wrongScore: wrong.finalScore,
      margin: Math.round((correct.finalScore - wrong.finalScore) * 1000) / 1000,
      matched: correct.matchedCount,
      implied: correct.impliedCount,
      total: correct.totalSkills,
      wrongDomainTitle: wrongDomain.title,
    });

    process.stderr.write(`${pass ? "PASS" : "FAIL"}  ${domain.title.padEnd(32)} margin=${results[i].margin.toFixed(3)}\n`);
  }

  const passed = results.filter((r) => r.pass).length;
  const accuracy = (passed / results.length) * 100;

  console.log("\n=== Per-domain results ===");
  console.table(
    results.map((r) => ({
      domain: r.title,
      result: r.pass ? "PASS" : "FAIL",
      correct_score: r.correctScore,
      wrong_score: r.wrongScore,
      margin: r.margin,
      "matched+implied/total": `${r.matched + r.implied}/${r.total}`,
      "vs (wrong resume)": r.wrongDomainTitle,
    }))
  );

  const failures = results.filter((r) => !r.pass);
  if (failures.length > 0) {
    console.log("\n=== Failures ===");
    failures.forEach((f) =>
      console.log(`- ${f.title}: correct=${f.correctScore} vs wrong=${f.wrongScore} (tested against "${f.wrongDomainTitle}" resume)`)
    );
  }

  const margins = results.map((r) => r.margin);
  const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
  const minMargin = Math.min(...margins);

  console.log("\n=== Summary ===");
  console.log(`Domains tested: ${results.length}`);
  console.log(`Ranking accuracy: ${passed}/${results.length} (${accuracy.toFixed(1)}%)`);
  console.log(`Avg margin (correct - wrong): ${avgMargin.toFixed(3)}`);
  console.log(`Min margin: ${minMargin.toFixed(3)}`);
  console.log(`Domains auto-classified into a curated taxonomy instead of "general": ${misclassified}/${results.length}`);
  console.log(
    `Avg skill coverage on correct resume (matched+implied/total): ${(
      results.reduce((sum, r) => sum + (r.matched + r.implied) / r.total, 0) / results.length * 100
    ).toFixed(1)}%`
  );
}

run();
