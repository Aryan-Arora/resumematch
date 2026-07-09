import { getEmbedding, cosineSimilarity } from "./embedding.js";

// One anchor phrase per taxonomy domain in skillTaxonomy.json. Keep in sync —
// classifyDomain() picks whichever anchor the JD embedding is closest to.
const DOMAIN_ANCHORS = {
  tech: "software engineering job requiring programming languages, frameworks, and cloud infrastructure",
  service_delivery: "IT service delivery or operations role handling SLAs, incidents, and vendor management",
  sales: "sales or business development role handling pipeline, quota, and client accounts",
  marketing: "marketing role handling campaigns, content, SEO, and brand strategy",
  finance_accounting: "finance or accounting role handling budgeting, reporting, and reconciliation",
  hr_recruiting: "human resources or recruiting role handling talent acquisition and employee relations",
};

let anchorEmbeddingsPromise = null;

function getAnchorEmbeddings() {
  if (!anchorEmbeddingsPromise) {
    anchorEmbeddingsPromise = Promise.all(
      Object.entries(DOMAIN_ANCHORS).map(async ([domain, phrase]) => [
        domain,
        await getEmbedding(phrase),
      ])
    );
  }
  return anchorEmbeddingsPromise;
}

export async function classifyDomain(jdEmbedding) {
  const anchors = await getAnchorEmbeddings();
  let best = "tech";
  let bestScore = -Infinity;
  for (const [domain, anchorEmbedding] of anchors) {
    const score = cosineSimilarity(jdEmbedding, anchorEmbedding);
    if (score > bestScore) {
      bestScore = score;
      best = domain;
    }
  }
  return best;
}

export function getDomainList() {
  // "general" isn't a curated taxonomy — it's the escape hatch that triggers
  // JD keyphrase extraction instead, offered as an explicit manual override.
  return [...Object.keys(DOMAIN_ANCHORS), "general"];
}
