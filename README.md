# ResumeMatch

HR candidate screening tool: upload one job description, bulk-upload resumes, get a ranked, explainable shortlist (semantic similarity + skill-gap match — no black-box score, no external paid APIs).

## Stack

- **Backend**: Node.js + Express, `pdf-parse` / `mammoth` for resume parsing, `@xenova/transformers` for local embeddings (no API key, downloads the model on first run), Supabase (Postgres + `pgvector`) for storage.
- **Frontend**: React + Vite + Tailwind.

## Setup

> **Full walkthrough:** for an end-to-end setup + verification guide covering both
> the recruiter and seeker sides, the SQL migrations, and job ingestion, see
> [`docs/SETUP.md`](docs/SETUP.md).

### 1. Backend

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project settings (Project Settings → API). The service role key bypasses RLS, so keep it server-side only.
- `PORT` — defaults to `4000` if unset.
- `CORS_ORIGIN` — comma-separated list of origins allowed to call the API. Defaults to the local Vite dev ports.

Your Supabase project needs the `pgvector` extension enabled and the schema created. Run [`server/db/migrations/0001_baseline_schema.sql`](server/db/migrations/0001_baseline_schema.sql) against your project (Supabase SQL editor or `psql`) — it creates the `organizations` / `profiles` / `jobs` / `candidates` tables, their indexes, RLS policies, and the `resumes` storage bucket. That migration was reconstructed from the application code, so review it before relying on it in production.

Run the backend:

```bash
npm run dev
```

Runs on `http://localhost:4000` (or `$PORT`).

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

`client/.env` sets:

- `VITE_API_URL` — defaults to `http://localhost:4000/api`; point it at wherever your backend actually runs.
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — same Supabase project as the backend, but the **anon** key (safe to expose client-side), used only for login/signup. From Project Settings → API.

### 3. Run tests

```bash
npm test
```

Vitest suite covering skill extraction, scoring, the upload queue, domain classification, and full-pipeline integration tests (real embeddings, no mocks). `npm run test:pipeline` also still exists as a manual one-off smoke script.

### 4. (Optional) Ingest live jobs for the seeker side

The seeker experience matches a résumé against a corpus of real job postings.
Populate it from Adzuna (free tier ~1000 calls/month — get a key at
[developer.adzuna.com](https://developer.adzuna.com)), then run the ingestion CLI:

```bash
# in server .env: ADZUNA_APP_ID=... ADZUNA_APP_KEY=... (ADZUNA_COUNTRY optional)
npm run ingest -- --what "software engineer" --where "remote" --pages 1
```

Each posting is embedded once on fetch and cached in the `job_listings` table
(dedupe key `source` + `external_id`), so re-running never re-embeds unchanged
postings. Requires the `server/db/migrations/0003_job_listings.sql` migration.

## Auth & multi-tenancy

Each HR user signs up/logs in with any email (Supabase Auth, email + password). Workspaces are explicit organizations, not inferred from email domain: after signing in, a user either creates a new organization (getting a join code to share with teammates) or joins an existing one by entering its code. This is deliberate — deriving the workspace from email domain would put every Gmail/Outlook signup in one shared workspace with strangers.

Enforcement is at the Express layer (every query filtered by the requester's `org_id`, resolved from a `profiles` table keyed by user id) plus Postgres RLS policies on `jobs`/`candidates`/`organizations`/`profiles` as defense-in-depth (only relevant if something ever queries Supabase directly with a user JWT instead of through this API).

## Reliability & operations

- **Upload durability**: resumes are uploaded to Supabase Storage synchronously, before the candidate row is even created — parsing/scoring is what's queued in the background, not the upload itself. If the server crashes or restarts mid-processing, a recovery sweep on boot re-queues anything left `status: "queued"`, re-downloading the file from storage rather than relying on the original in-memory request.
- **Error monitoring**: set `SENTRY_DSN` to enable Sentry error reporting. Unset by default — errors only go to `console.error` locally.
- **Email delivery**: Supabase's default auth email sender is rate-limited and meant for development only. Before real sign-ups, configure a real SMTP provider (Resend, Postmark, SES, etc.) under Supabase Dashboard → Authentication → Emails → SMTP Settings.
- **Data retention**: see [`docs/DATA_RETENTION.md`](docs/DATA_RETENTION.md) for what's stored, how deletion works today, and what's still needed before handling real candidate data at scale.

## Notes

- First run downloads the embedding model (`all-MiniLM-L6-v2`) locally — expect a slower first request.
- Resume uploads: max 100 files per batch, 10MB per file. Unparseable files (scanned images, corrupted PDFs) are flagged, not silently scored as 0.
- Every API route (except `/api/health`) requires a valid Supabase session token — there is no way to disable auth for local dev anymore, sign up with any email to get started.
