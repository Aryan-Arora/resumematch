# Data Retention & Deletion Policy

This document describes what ResumeMatch stores, for how long, and how it gets deleted. It exists because resumes contain real personal information (names, contact details, employment history) and that data needs a stated, enforced policy before it's collected at any real scale — not an afterthought.

## What is collected

| Data | Where it lives | Contains PII? |
|---|---|---|
| Job description text + embedding | Postgres (`jobs` table) | No |
| Original resume file (PDF/DOCX) | Supabase Storage (`resumes` bucket) | Yes |
| Extracted resume text + embedding | Postgres (`candidates` table) | Yes |
| Match results (scores, matched/missing/implied skills) | Postgres (`candidates` table) | Indirectly (tied to a named candidate) |
| Account email | Supabase Auth | Yes |

Resumes are never sent to a third-party AI API — matching runs on local embedding models, so candidate data doesn't leave Supabase's infrastructure except when a recruiter explicitly opens the signed resume-view link.

## Retention period

**Jobs are automatically deleted 180 days after creation**, along with every non-starred candidate under them (resume file + row). A daily scheduled sweep (`server/services/retention.js`) enforces this — no manual action needed.

**Starring is the retention override.** A recruiter can star a candidate to protect them from this automatic deletion (and from manual job deletion — see below). Starring a candidate whose job gets deleted detaches them from the job (keeping a snapshot of the job title for context) rather than deleting them; they then live under "Starred CVs" indefinitely, until the recruiter unstars or deletes them explicitly.

- Account data (email) is kept for as long as the account is active, deleted on account closure.

## How deletion works today (already built)

- **Delete a candidate**: `DELETE /api/candidates/:id` — removes the resume file from storage and the database row. Immediate, not soft-deleted.
- **Delete a job**: `DELETE /api/jobs/:id` — deletes every non-starred candidate under the job (resume file + row), detaches and preserves starred candidates (job_id set to null, job title snapshotted), then deletes the job row. Implemented as `deleteJobCascade()` in `server/routes/jobs.js`, shared with the automated sweep below.
- **Automated 180-day sweep**: `runRetentionSweep()` in `server/services/retention.js` runs once on server boot and then every 24 hours. It finds jobs older than 180 days and runs the same `deleteJobCascade()` logic against them.
- **Star / unstar a candidate**: `PATCH /api/candidates/:id/star` — toggles the `starred` flag. `GET /api/candidates/starred` lists all starred candidates for the company, across jobs (including ones whose job no longer exists).
- Unstarring a candidate whose job has already been deleted (no `job_id`) deletes them outright, since starring was the only thing keeping them reachable — the frontend surfaces this as "Unstar (deletes)".
- All of the above are scoped to the requesting user's company — a company can only act on its own data.

## What's not yet implemented

- **No candidate-initiated deletion request flow.** A candidate whose resume was screened has no self-service way to request removal — today this would have to be handled manually (recruiter deletes the candidate row on request).
- **No audit log of who accessed, starred, or deleted what.** Deletion and starring happen, but there's no record of when or by whom.
- **The 180-day clock runs from job creation, not from a "closed/filled" status** — the app has no concept of closing a job yet, so the "90 days after closed" half of the originally recommended policy isn't implemented, only the 180-day fallback.

## Before handling real candidate data at scale, this still needs

1. A documented process for handling a candidate's deletion request (who receives it, how fast it's actioned — many jurisdictions require this within a defined window, e.g. 30 days under GDPR).
2. A privacy notice shown to candidates at the point resumes are collected, if this is ever used to collect resumes directly from applicants rather than sourced resumes brought in by a recruiter.
3. Legal review — this document is an engineering-level policy statement, not legal advice, and hasn't been reviewed by counsel.
