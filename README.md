# ResumeMatch

HR candidate screening tool: upload one job description, bulk-upload resumes, get a ranked, explainable shortlist (semantic similarity + skill-gap match — no black-box score, no external paid APIs).

## Stack

- **Backend**: Node.js + Express, `pdf-parse` / `mammoth` for resume parsing, `@xenova/transformers` for local embeddings (no API key, downloads the model on first run), Supabase (Postgres + `pgvector`) for storage.
- **Frontend**: React + Vite + Tailwind.

## Setup

### 1. Backend

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project settings (Project Settings → API). The service role key bypasses RLS, so keep it server-side only.
- `PORT` — defaults to `4000` if unset.
- `CORS_ORIGIN` — comma-separated list of origins allowed to call the API. Defaults to the local Vite dev ports.

Your Supabase project needs the `pgvector` extension enabled and the `jobs` / `candidates` tables + `resumes` storage bucket created — see the SQL migrations that were run when this project was set up (ask in the conversation history, or recreate from `server/routes/*.js` which shows the expected schema).

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

- `VITE_API_URL` — defaults to `http://localhost:4100/api`; point it at wherever your backend actually runs.
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — same Supabase project as the backend, but the **anon** key (safe to expose client-side), used only for login/signup. From Project Settings → API.

### 3. Run tests

```bash
npm test
```

Vitest suite covering skill extraction, scoring, the upload queue, domain classification, and full-pipeline integration tests (real embeddings, no mocks). `npm run test:pipeline` also still exists as a manual one-off smoke script.

## Auth & multi-tenancy

Each HR user signs up/logs in with their work email (Supabase Auth, email + password). A user's "company" is derived from their email domain — everyone `@acmecorp.com` shares one workspace and only sees jobs/candidates created by someone with that same domain. This means personal email domains (gmail.com, outlook.com, etc.) all share one workspace, which is fine for local testing but not for real multi-company use — use real company emails to sign up.

Enforcement is at the Express layer (every query filtered by the requester's email domain) plus Postgres RLS policies on `jobs`/`candidates` as defense-in-depth (only relevant if something ever queries Supabase directly with a user JWT instead of through this API).

## Notes

- First run downloads the embedding model (`all-MiniLM-L6-v2`) locally — expect a slower first request.
- Resume uploads: max 100 files per batch, 10MB per file. Unparseable files (scanned images, corrupted PDFs) are flagged, not silently scored as 0.
- Every API route (except `/api/health`) requires a valid Supabase session token — there is no way to disable auth for local dev anymore, sign up with any email to get started.
