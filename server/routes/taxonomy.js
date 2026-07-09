import { Router } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(
  readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8")
);

const router = Router();

router.get("/skill-taxonomy", (req, res) => {
  const { domain } = req.query;
  if (domain === "general") return res.json({}); // no curated categories to bucket by
  res.json(domain && taxonomy[domain] ? taxonomy[domain] : taxonomy.tech);
});

export default router;
