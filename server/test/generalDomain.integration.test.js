import { describe, it, expect, beforeAll } from "vitest";
import { getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { classifyDomain } from "../services/domainClassify.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";
import { findImpliedSkills, KEYPHRASE_MATCH_THRESHOLD } from "../services/semanticSkillMatch.js";
import { computeFinalScore } from "../services/scoring.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8"));

const JD = `
Public Speaking Coach

We are looking for an experienced Public Speaking Coach to help executives
improve their presentation skills and stage presence. You will design
keynote delivery workshops, coach clients on storytelling techniques,
audience engagement, vocal projection, and body language. Strong
background in TEDx-style talks, executive communication training, and
public speaking coaching is required.
`;

// Same skills, deliberately paraphrased instead of using the JD's exact
// wording — this is what findImpliedSkills is supposed to catch.
const STRONG_FIT_RESUME = `
Jordan Reyes

For eight years I've helped executives get comfortable in front of a
crowd — working through nerves, sharpening how they hold an audience's
attention, and coaching them on posture and gesture while they're on stage.
I've run workshops on structuring a talk so it builds to a strong close, and
prepped multiple clients for TEDx-style events. I also lead corporate
communication training programs for leadership teams.
`;

const WEAK_FIT_RESUME = `
Sam Patel

Office administrator with five years of experience managing schedules,
processing invoices, and coordinating vendor logistics for a mid-size
company. Proficient in Excel and Outlook.
`;

async function scoreResume(jdEmbedding, jdSkills, jdDomainKind, resumeText) {
  const resumeEmbedding = await getEmbedding(resumeText);
  const semanticScore = cosineSimilarity(jdEmbedding, resumeEmbedding);
  const taxonomyArg = jdDomainKind === "general" ? { keyphrases: jdSkills } : taxonomy[jdDomainKind];
  const resumeSkills = extractSkills(resumeText, taxonomyArg);
  const { matched, missing } = compareSkills(jdSkills, resumeSkills);
  const { impliedSkills } = await findImpliedSkills(missing, resumeText, new Map(), {
    threshold: jdDomainKind === "general" ? KEYPHRASE_MATCH_THRESHOLD : undefined,
  });
  const skillScore = jdSkills.length > 0 ? (matched.length + impliedSkills.length) / jdSkills.length : 0;
  return {
    finalScore: computeFinalScore(semanticScore, skillScore),
    matched,
    impliedSkills,
  };
}

describe("general-domain fallback (JD-derived keyphrases)", () => {
  let jdEmbedding;
  let jdSkills;
  let jdDomain;

  beforeAll(async () => {
    jdEmbedding = await getEmbedding(JD);
    const candidateDomain = await classifyDomain(jdEmbedding);
    const candidateSkills = extractSkills(JD, taxonomy[candidateDomain]);
    if (candidateSkills.length === 0) {
      jdDomain = "general";
      jdSkills = extractKeyphrases(JD, { minWordsPerPhrase: 2 });
    } else {
      jdDomain = candidateDomain;
      jdSkills = candidateSkills;
    }
  }, 30000);

  it("falls back to general (none of the 10 curated domains fit)", () => {
    expect(jdDomain).toBe("general");
  });

  it("extracts sensible keyphrases as the JD skill list", () => {
    expect(jdSkills).toEqual(
      expect.arrayContaining(["public speaking coach", "audience engagement", "stage presence"])
    );
  });

  it("scores the paraphrased strong-fit resume higher than the unrelated resume", async () => {
    const [strong, weak] = await Promise.all([
      scoreResume(jdEmbedding, jdSkills, jdDomain, STRONG_FIT_RESUME),
      scoreResume(jdEmbedding, jdSkills, jdDomain, WEAK_FIT_RESUME),
    ]);

    expect(strong.finalScore).toBeGreaterThan(weak.finalScore);
  }, 30000);

  it("catches at least one paraphrased skill via semantic implied matching", async () => {
    const { impliedSkills } = await scoreResume(jdEmbedding, jdSkills, jdDomain, STRONG_FIT_RESUME);
    expect(impliedSkills.length).toBeGreaterThan(0);
  }, 30000);

  it("does not produce false-positive implied matches for a genuinely unrelated resume", async () => {
    const { impliedSkills } = await scoreResume(jdEmbedding, jdSkills, jdDomain, WEAK_FIT_RESUME);
    expect(impliedSkills).toEqual([]);
  }, 30000);

  it("excludes single-word junk phrases from the extracted skill list", () => {
    expect(jdSkills).not.toContain("background");
    expect(jdSkills).not.toContain("presentation");
  });
});
