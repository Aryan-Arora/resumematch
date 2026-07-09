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
- `APP_PASSWORD` — optional. If set, every API request must include it in the `x-api-key` header, and the frontend will show a password gate. Leave empty for local dev.
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

`client/.env` sets `VITE_API_URL` — defaults to `http://localhost:4100/api` in the example file; point it at wherever your backend actually runs.

### 3. Verify the pipeline standalone (optional)

```bash
npm run test:pipeline
```

Runs one hardcoded JD/resume pair through parsing → embedding → skill matching → scoring and prints the result. This is a manual smoke-check script, not an automated test suite — there is no `npm test` with assertions yet.

## Notes

- First run downloads the embedding model (`all-MiniLM-L6-v2`) locally — expect a slower first request.
- Resume uploads: max 100 files per batch, 10MB per file. Unparseable files (scanned images, corrupted PDFs) are flagged, not silently scored as 0.
- No authentication beyond the optional shared `APP_PASSWORD` gate — do not deploy this publicly without setting one, since the backend uses the Supabase service role key and has no other access control.
