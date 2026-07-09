import { getPreciseEmbedding, cosineSimilarity } from "./embedding.js";

// Cosine similarity threshold above which a resume chunk counts as evidence
// for a skill that was never literally mentioned. Calibrated empirically
// against all-mpnet-base-v2: genuinely absent skills (MongoDB, AWS, React,
// Docker tested against a Kubernetes/PostgreSQL/CI/CD JD) topped out ~0.47,
// genuine implied matches landed 0.40-0.58. 0.50 cleanly excludes every false
// positive found in testing while still catching strong true positives.
// Weaker true positives (paraphrased with little topical specificity) can
// still fall short — this is a deliberate precision-over-recall choice.
const SEMANTIC_MATCH_THRESHOLD = 0.5;

// Longer JD-derived keyphrases (from keyphraseExtract.js, used for the
// "general" domain fallback) score systematically lower than short taxonomy
// terms even for genuine paraphrase matches — averaging more tokens dilutes
// the embedding. Calibrated against a real paraphrased resume: an unrelated
// resume topped out at 0.32 against public-speaking phrases, while genuine
// paraphrased matches ("audience engagement" / "stage presence") landed
// 0.42-0.54. 0.42 keeps a comfortable margin above the false-positive ceiling.
const KEYPHRASE_MATCH_THRESHOLD = 0.42;

// Minimum word count for a resume line to be considered — drops headers,
// names, and section titles that produce noisy, generically-similar embeddings.
const MIN_CHUNK_WORDS = 6;

// Hard cap on chunks compared per resume, longest (most substantive) first.
// Bounds worst-case latency on long resumes — mpnet is ~5x slower per call
// than the MiniLM model used for the main JD/resume score, so this matters.
const MAX_CHUNKS = 15;

// A few taxonomy terms embed poorly on their own (symbols/abbreviations
// confuse the tokenizer) — expand them to a fuller phrase for embedding only.
// Display names elsewhere in the app are untouched.
const SKILL_EMBEDDING_EXPANSIONS = {
  "CI/CD": "continuous integration and continuous deployment pipelines",
  "C++": "C plus plus programming",
  "C#": "C sharp programming",
  ".NET": "dot net framework",
};

function skillEmbeddingPhrase(skill) {
  const expanded = SKILL_EMBEDDING_EXPANSIONS[skill] || skill;
  return `professional experience using ${expanded}`;
}

export { KEYPHRASE_MATCH_THRESHOLD };

export function chunkResumeText(text) {
  // Split on newlines first, then further split each block into sentences —
  // a resume written as continuous prose (no line breaks) would otherwise
  // collapse into one giant chunk, diluting the embedding for any single
  // skill mention. A no-op for already bullet/line-per-fact resumes.
  const lines = text
    .split(/\n+/)
    .flatMap((block) => block.split(/(?<=[.!?])\s+(?=[A-Z])/))
    .map((line) => line.trim())
    .filter((line) => line.split(/\s+/).filter(Boolean).length >= MIN_CHUNK_WORDS);

  return lines
    .sort((a, b) => b.length - a.length)
    .slice(0, MAX_CHUNKS);
}

/**
 * Finds skills that aren't literally mentioned in the resume but are
 * semantically implied by its content (e.g. "orchestrated containerized
 * deployments" implying Kubernetes experience).
 *
 * @param missingSkills - skills required by the JD but not literally matched
 * @param resumeText - full extracted resume text
 * @param skillEmbeddingCache - Map<skill, embedding> reused across a batch upload
 * @param options.threshold - overrides SEMANTIC_MATCH_THRESHOLD (use KEYPHRASE_MATCH_THRESHOLD for JD-derived phrases)
 * @returns { impliedSkills: string[], evidence: Record<string, string> }
 */
export async function findImpliedSkills(missingSkills, resumeText, skillEmbeddingCache, options = {}) {
  const threshold = options.threshold ?? SEMANTIC_MATCH_THRESHOLD;
  if (missingSkills.length === 0) {
    return { impliedSkills: [], evidence: {} };
  }

  const chunks = chunkResumeText(resumeText);
  if (chunks.length === 0) {
    return { impliedSkills: [], evidence: {} };
  }

  const chunkEmbeddings = [];
  for (const chunk of chunks) {
    chunkEmbeddings.push(await getPreciseEmbedding(chunk));
  }

  const impliedSkills = [];
  const evidence = {};

  for (const skill of missingSkills) {
    let skillEmbedding = skillEmbeddingCache.get(skill);
    if (!skillEmbedding) {
      skillEmbedding = await getPreciseEmbedding(skillEmbeddingPhrase(skill));
      skillEmbeddingCache.set(skill, skillEmbedding);
    }

    let bestSimilarity = -1;
    let bestChunk = null;
    for (let i = 0; i < chunks.length; i++) {
      const similarity = cosineSimilarity(skillEmbedding, chunkEmbeddings[i]);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestChunk = chunks[i];
      }
    }

    if (bestSimilarity >= threshold) {
      impliedSkills.push(skill);
      evidence[skill] = bestChunk;
    }
  }

  return { impliedSkills, evidence };
}
