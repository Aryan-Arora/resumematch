import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getEmbedding, cosineSimilarity } from "../services/embedding.js";
import { extractSkills, compareSkills } from "../services/skillMatch.js";
import { computeFinalScore } from "../services/scoring.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(
  readFileSync(join(__dirname, "../data/skillTaxonomy.json"), "utf-8")
);

const sampleJD = `
Senior Backend Engineer

We are looking for a Senior Backend Engineer to join our platform team.
You will design and build scalable REST APIs and microservices using Node.js
and Express, backed by PostgreSQL and Redis. Experience with Docker,
Kubernetes, and AWS (EC2, S3, Lambda) is required. You should be comfortable
writing TypeScript, working with CI/CD pipelines (GitHub Actions), and
collaborating in an Agile/Scrum environment. Familiarity with GraphQL and
Kafka is a plus.

Requirements:
- 5+ years of professional software engineering experience
- Strong proficiency in JavaScript/TypeScript and Node.js
- Experience with PostgreSQL, Redis, and database design
- Hands-on experience with AWS, Docker, and Kubernetes
- Familiarity with microservices architecture and REST APIs
- Experience with Git and CI/CD workflows
`;

const sampleResume = `
Jordan Lee
Backend Software Engineer

Summary:
Backend engineer with 6 years of experience building scalable web services
and APIs. Deep expertise in Node.js, Express, and TypeScript. Comfortable
owning services end to end, from database design to deployment.

Experience:
Senior Software Engineer, Acme Corp (2021–Present)
- Built and maintained microservices using Node.js and Express
- Designed PostgreSQL schemas and optimized queries for high-traffic APIs
- Deployed services to AWS (EC2, S3) using Docker and Terraform
- Set up CI/CD pipelines with GitHub Actions
- Worked in an Agile team with two-week sprints

Software Engineer, Widgets Inc (2018–2021)
- Developed REST APIs in Python and Flask
- Used Redis for caching and session storage
- Collaborated with frontend team building React applications
- Wrote unit tests with Jest

Skills: JavaScript, TypeScript, Node.js, Express, PostgreSQL, Redis, Docker,
AWS, Git, REST APIs, Agile, Jest, Python, Flask, React
`;

async function runPipeline(jdText, resumeText) {
  const [jdEmbedding, resumeEmbedding] = await Promise.all([
    getEmbedding(jdText),
    getEmbedding(resumeText),
  ]);
  const semanticScore = cosineSimilarity(jdEmbedding, resumeEmbedding);

  const jdSkills = extractSkills(jdText, taxonomy);
  const resumeSkills = extractSkills(resumeText, taxonomy);
  const { matched, missing } = compareSkills(jdSkills, resumeSkills);
  const skillScore = jdSkills.length > 0 ? matched.length / jdSkills.length : 0;

  const finalScore = computeFinalScore(semanticScore, skillScore);

  return { semanticScore, skillScore, finalScore, jdSkills, resumeSkills, matched, missing };
}

async function main() {
  console.log("Running ResumeMatch Phase 1 pipeline test...\n");
  const result = await runPipeline(sampleJD, sampleResume);

  console.log("=== JD skills detected ===");
  console.log(result.jdSkills.join(", "));

  console.log("\n=== Resume skills detected ===");
  console.log(result.resumeSkills.join(", "));

  console.log("\n=== Skill match ===");
  console.log("Matched:", result.matched.join(", ") || "(none)");
  console.log("Missing:", result.missing.join(", ") || "(none)");

  console.log("\n=== Scores ===");
  console.log(`Semantic similarity: ${result.semanticScore.toFixed(3)}`);
  console.log(`Skill score:         ${result.skillScore.toFixed(3)}`);
  console.log(`Final score:         ${result.finalScore.toFixed(3)}`);
}

main().catch((err) => {
  console.error("Pipeline test failed:", err);
  process.exit(1);
});
