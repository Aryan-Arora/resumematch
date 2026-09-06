import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getEmbedding, getPreciseEmbedding } from "./embedding.js";
import { skillEmbeddingPhrase, getSharedSkillEmbeddingCache } from "./semanticSkillMatch.js";
import { flattenTaxonomy } from "./skillMatch.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Both @xenova/transformers pipelines lazy-load their model weights on first
// use, and every taxonomy skill's embedding used to get computed from scratch
// on whichever request happened to need it first. Left alone, that cost gets
// paid by an actual user's request — whoever's unlucky enough to hit a
// freshly-deployed (or freshly cold) machine. Running it here instead, fired
// once right after the server starts listening, means the server eats that
// cost itself, off the request path, before real traffic has a chance to.
//
// This does NOT eliminate cold starts — a request arriving before this
// finishes still pays the cost normally, and every machine still warms up
// independently. It just means the server's own boot sequence is usually the
// one to hit it first, rather than whichever real request happens to.
export async function warmModels() {
  const start = Date.now();
  try {
    await Promise.all([getEmbedding("warm up"), getPreciseEmbedding("warm up")]);

    const taxonomy = JSON.parse(
      readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8")
    );
    const allSkills = new Set();
    for (const domainTaxonomy of Object.values(taxonomy)) {
      for (const skill of flattenTaxonomy(domainTaxonomy)) allSkills.add(skill);
    }

    const cache = getSharedSkillEmbeddingCache();
    for (const skill of allSkills) {
      if (cache.has(skill)) continue;
      cache.set(skill, await getPreciseEmbedding(skillEmbeddingPhrase(skill)));
    }

    console.log(
      `Model warm-up complete: ${allSkills.size} taxonomy skills cached in ${Date.now() - start}ms.`
    );
  } catch (err) {
    // Never let a warm-up failure take the server down — worst case, the
    // first real request just pays the lazy-load cost itself, same as before
    // this existed.
    console.error("Model warm-up failed (non-fatal, first request will warm up instead):", err);
  }
}
