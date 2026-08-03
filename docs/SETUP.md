# Setup & Verification

End-to-end walkthrough: from a blank Supabase project to both front doors
running locally — the **recruiter** side (job → ranked candidates) and the new
**seeker** side (résumé → ranked jobs). Follow top to bottom.

> TL;DR: apply the 6 SQL migrations → set two `.env` files → `npm run dev`
> (backend) + `cd client && npm run dev` (frontend) → open `/login` (recruiter)
> or `/seeker` (job seeker).

---

## 0. Prerequisites

- **Node.js ≥ 20** (`node -v`).
- A free **Supabase** project — <https://supabase.com>.
- *(Optional, for the seeker side)* a free **Adzuna** API key —
  <https://developer.adzuna.com> (free tier ~1000 calls/month).

First backend run downloads two local embedding models (~100 MB) to a cache, so
the first request is slow, then fast. No paid AI API is used.

---

## 1. Supabase: schema + storage

1. Create a Supabase project. Open **SQL Editor**.
2. Run each migration **in order**, pasting the file contents and executing:
   - `server/db/migrations/0001_baseline_schema.sql` — tables, `pgvector`, RLS, the `resumes` storage bucket
   - `server/db/migrations/0002_vector_search.sql` — HNSW indexes + `match_candidates()`
   - `server/db/migrations/0003_job_listings.sql` — job corpus + `match_jobs()`
   - `server/db/migrations/0004_seeker.sql` — seeker résumés + consent
   - `server/db/migrations/0005_applications.sql` — seeker application tracker (Kanban)
   - `server/db/migrations/0006_talent_search.sql` — talent marketplace search
3. Confirm under **Database → Tables** you see `organizations`, `profiles`,
   `jobs`, `candidates`, `job_listings`, `seeker_resumes`, `applications`, and
   under **Storage** a private `resumes` bucket.
4. Grab your keys from **Project Settings → API**:
   - Project URL
   - `service_role` key (server only — **never** ship to the browser)
   - `anon` key (safe for the browser)

> These migrations were reconstructed from the app code. If you already have a
> live schema, diff before applying (see each file's header).

---

## 2. Backend `.env`

From the repo root:

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```bash
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
PORT=4000                     # optional, defaults to 4000
CORS_ORIGIN=http://localhost:5173,http://localhost:5174   # optional, this is the default

# Optional — seeker job ingestion:
ADZUNA_APP_ID=<your app id>
ADZUNA_APP_KEY=<your app key>
ADZUNA_COUNTRY=us             # us, gb, in, ca, au, ...

# Optional — recruiter shortlist emails: RESEND_API_KEY, MAIL_FROM
# Optional — error monitoring: SENTRY_DSN
```

Run it:

```bash
npm run dev
```

Expect `ResumeMatch API listening on port 4000`. Sanity check:

```bash
curl http://localhost:4000/api/health      # -> {"ok":true}
```

---

## 3. Frontend `.env`

```bash
cd client
npm install
cp .env.example .env
```

Fill in `client/.env`:

```bash
VITE_API_URL=http://localhost:4000/api      # defaults to this now (matches the backend)
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Run it:

```bash
npm run dev
```

Vite serves on <http://localhost:5173>.

> If the page is blank, the Supabase env vars are missing — the client needs
> `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to start.

---

## 4. (Optional) Ingest jobs for the seeker side

The seeker experience needs a corpus of jobs to match against. With the Adzuna
keys set (step 2) and migration `0003` applied:

```bash
npm run ingest -- --what "software engineer" --where "remote" --pages 1
npm run ingest -- --what "registered nurse" --country us
```

Each posting is embedded once and cached in `job_listings`; re-running never
re-embeds unchanged postings. Mind the ~1000 calls/month free tier.

---

## 5. Verify — Recruiter door (job → candidates)

1. Open <http://localhost:5173/login>, sign up with any email, confirm if asked.
2. Create or join an organization (you'll get a join code to share).
3. **New Job** → paste a job description → **Continue to Upload**.
4. Upload a few `.pdf`/`.docx` résumés. Watch them process (queued → scored).
5. You should see a ranked candidate table with match rings, matched/implied/
   missing skills, CSV export, and the AEDT compliance notice.

**Cross-job talent search (M1)** is a live API endpoint (no UI button yet).
With a logged-in session token:

```bash
curl -X POST http://localhost:4000/api/candidates/search \
  -H "Authorization: Bearer <supabase access token>" \
  -H "Content-Type: application/json" \
  -d '{"description":"senior node.js engineer","limit":10}'
```

→ ranked candidates from across **all** your org's jobs.
*(Grab the token in the browser devtools console:
`(await window.supabase?.auth?.getSession?.())` isn't exposed globally — easiest
is to copy it from the Network tab's Authorization header on any API call.)*

---

## 6. Verify — Seeker door (résumé → jobs)

1. Open <http://localhost:5173/seeker> and sign in (same accounts; seekers just
   aren't tied to an organization).
2. **Upload résumé** (`.pdf`/`.docx`).
3. You'll see **live jobs ranked by fit**. Expand any job for **"why you match"**
   + **"the gap"**, and a **View & apply** link.
4. If matches are empty, ingest jobs first (step 4).
5. **Save** a job → switch to the **My applications** tab → move it through the
   Kanban stages (Saved → Applied → Interviewing → Offer → Rejected).
6. Optionally flip **"Visible to recruiters"** — the opt-in consent flag that
   makes your résumé searchable in the recruiter Talent Search (off by default).

---

## 7. Verify — Talent marketplace (recruiter searches seekers)

1. As a **seeker** (step 6), toggle a résumé **"Visible to recruiters"** on.
2. As a **recruiter**, open **Talent Search** in the sidebar.
3. Pick an existing job or paste a role → **Search talent pool**.
4. You'll see **anonymized** opted-in candidates ranked by fit (e.g. "Candidate
   3F9A2C" with a match %). Expand one for its skill overlap (has / lacks) —
   still no name or contact. (Double-blind contact unlock is a planned follow-on.)

## Troubleshooting

| Symptom | Fix |
|---|---|
| Blank frontend page | `client/.env` missing `VITE_SUPABASE_*` — the Supabase client can't init. |
| `Missing SUPABASE_URL...` on backend start | Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in root `.env`. |
| CORS error in the browser | Add your Vite origin to `CORS_ORIGIN` (default already includes 5173/5174). |
| First upload/match is very slow | First run downloads the embedding models; subsequent calls are fast. |
| Seeker matches always empty | No jobs ingested yet — run `npm run ingest` (needs Adzuna keys + `0003`). |
| `ADZUNA_APP_ID / ADZUNA_APP_KEY are not set` | Add the Adzuna keys to root `.env`. |
| 401 on API calls | You're not signed in, or the session expired — sign in again. |

> **Note on RLS:** the migrations enable Row Level Security as defense-in-depth,
> but the API talks to Supabase with the `service_role` key, which bypasses RLS —
> so the app works regardless. RLS only matters if something queries these tables
> with a user JWT directly.
