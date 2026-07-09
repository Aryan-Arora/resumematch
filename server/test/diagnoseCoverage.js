// Diagnostic: for the worst-coverage domains from the stress test, show every
// missing skill's best-matching resume chunk and similarity score (even if
// below threshold) to see WHY it wasn't caught.

import { getEmbedding, cosineSimilarity, getPreciseEmbedding } from "../services/embedding.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { classifyDomain } from "../services/domainClassify.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";
import { chunkResumeText, KEYPHRASE_MATCH_THRESHOLD } from "../services/semanticSkillMatch.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { DOMAINS } from "./fixtures/domainStressData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8"));

const TARGET_TITLES = ["Bartender", "Veterinarian", "Librarian", "Museum Curator", "Costume Designer", "Notary Public"];

function buildJD(domain) {
  return `${domain.title}\n\nWe need someone experienced in ${domain.phrases.join(", ")}. Strong background as a ${domain.title.toLowerCase()} required.`;
}

async function diagnose(domain) {
  const jdText = buildJD(domain);
  const jdEmbedding = await getEmbedding(jdText);
  const candidateDomain = await classifyDomain(jdEmbedding);
  const candidateSkills = extractSkills(jdText, taxonomy[candidateDomain]);
  const jdSkills = candidateSkills.length > 0 ? candidateSkills : extractKeyphrases(jdText, { minWordsPerPhrase: 2 });

  const resumeSkills = extractSkills(domain.resume, { keyphrases: jdSkills });
  const { matched, missing } = compareSkills(jdSkills, resumeSkills);

  console.log(`\n=== ${domain.title} ===`);
  console.log("JD skills:", jdSkills);
  console.log("Literal matched:", matched);
  console.log("Resume:", domain.resume.replace(/\s+/g, " ").trim());

  const chunks = chunkResumeText(domain.resume);
  const chunkEmbeddings = await Promise.all(chunks.map((c) => getPreciseEmbedding(c)));

  for (const skill of missing) {
    const skillEmbedding = await getPreciseEmbedding(`professional experience using ${skill}`);
    let best = -1;
    let bestChunk = null;
    chunkEmbeddings.forEach((ce, i) => {
      const s = cosineSimilarity(skillEmbedding, ce);
      if (s > best) {
        best = s;
        bestChunk = chunks[i];
      }
    });
    const caught = best >= KEYPHRASE_MATCH_THRESHOLD;
    console.log(
      `  [${caught ? "CAUGHT" : "missed"}] "${skill}" best=${best.toFixed(3)} <- "${bestChunk}"`
    );
  }
}

async function run() {
  for (const title of TARGET_TITLES) {
    const domain = DOMAINS.find((d) => d.title === title);
    await diagnose(domain);
  }
}

run();
