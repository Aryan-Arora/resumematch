// Manual job ingestion for the seeker corpus (M2).
//
// Adzuna's free tier is ~1000 calls/month, so this is a controlled CLI run
// rather than an unattended scheduler. Requires ADZUNA_APP_ID / ADZUNA_APP_KEY
// (and optionally ADZUNA_COUNTRY) plus SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// in the server .env, and the 0003_job_listings.sql migration applied.
//
// Usage:
//   npm run ingest -- --what "software engineer" --where "remote"
//   npm run ingest -- --what "registered nurse" --country us --pages 2
import "dotenv/config";
import { ingestFromAdzuna } from "../services/jobIngestion.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    args[key] = next && !next.startsWith("--") ? argv[++i] : "true";
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (!args.what) {
  console.error(
    'Usage: npm run ingest -- --what "<search terms>" [--where "<location>"] [--country us] [--pages 1]'
  );
  process.exit(1);
}

try {
  const summaries = await ingestFromAdzuna({
    queries: [{ what: args.what, where: args.where || "" }],
    country: args.country,
    pages: Number(args.pages) || 1,
  });
  console.log("Ingestion complete:");
  console.log(JSON.stringify(summaries, null, 2));
  process.exit(0);
} catch (err) {
  console.error("Ingestion failed:", err.message);
  process.exit(1);
}
