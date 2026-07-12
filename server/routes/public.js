import { Router } from "express";
import rateLimit from "express-rate-limit";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getEmbedding } from "../services/embedding.js";
import { extractSkills } from "../services/skillMatch.js";
import { classifyDomain, getDomainList } from "../services/domainClassify.js";
import { extractKeyphrases } from "../services/keyphraseExtract.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(
  readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8")
);

const router = Router();

// Unauthenticated and runs an embedding model — the one route in this app
// with no logged-in user behind it to hold accountable, so it's the one
// that most needs its own rate limit rather than relying on general auth.
const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this address — please try again in a few minutes." },
});

router.post("/public/classify", demoLimiter, async (req, res) => {
  const { description } = req.body || {};
  if (!description || description.trim().length < 20) {
    return res
      .status(400)
      .json({ error: "Paste a fuller job description (at least a couple of sentences)." });
  }
  if (description.length > 5000) {
    return res.status(400).json({ error: "That's too long — please paste under 5,000 characters." });
  }

  try {
    const jdEmbedding = await getEmbedding(description);
    const candidateDomain = await classifyDomain(jdEmbedding);
    const candidateSkills = extractSkills(description, taxonomy[candidateDomain]);

    let domain;
    let skills;
    if (candidateSkills.length === 0) {
      domain = "general";
      skills = extractKeyphrases(description, { minWordsPerPhrase: 2 });
    } else {
      domain = candidateDomain;
      skills = candidateSkills;
    }

    res.json({ domain, skills, curatedDomains: getDomainList().filter((d) => d !== "general") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong processing that description." });
  }
});

export default router;
