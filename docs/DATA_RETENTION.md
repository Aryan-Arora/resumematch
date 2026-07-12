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

**Current default: indefinite, tied to the job posting.** Candidate data for a job is kept for as long as that job exists in the system. This is a placeholder, not a considered policy — see "What's not yet implemented" below.

**Recommended policy going forward:**
- Candidate data should be deleted automatically **90 days after a job is closed/filled**, or **180 days after the job's last activity** if it's never explicitly closed — whichever comes first. 90–180 days covers the realistic window a company might need to revisit a hiring decision (disputes, re-opening a role) without holding data indefinitely by default.
- Account data (email) is kept for as long as the account is active, deleted on account closure.

## How deletion works today (already built)

- **Delete a candidate**: `DELETE /api/candidates/:id` — removes the resume file from storage and the database row. Immediate, not soft-deleted.
- **Delete a job**: `DELETE /api/jobs/:id` — removes every resume file under that job's storage prefix, then the job row (candidates cascade-delete via foreign key).
- Both are scoped to the requesting user's company — a company can only delete its own data.

These give recruiters manual control today. What's missing is automation — nothing currently deletes data on its own after a retention period elapses.

## What's not yet implemented

- **No automatic expiry.** Nothing currently deletes old candidate data on a schedule. Until this exists, retention is effectively indefinite for any job the recruiter doesn't manually delete.
- **No candidate-initiated deletion request flow.** A candidate whose resume was screened has no self-service way to request removal — today this would have to be handled manually (recruiter deletes the candidate row on request).
- **No audit log of who accessed or deleted what.** Deletion happens, but there's no record of when or by whom.

## Before handling real candidate data at scale, this needs

1. An automated retention job (e.g. a scheduled task that deletes candidates past the 90/180-day threshold described above).
2. A documented process for handling a candidate's deletion request (who receives it, how fast it's actioned — many jurisdictions require this within a defined window, e.g. 30 days under GDPR).
3. A privacy notice shown to candidates at the point resumes are collected, if this is ever used to collect resumes directly from applicants rather than sourced resumes brought in by a recruiter.
4. Legal review — this document is an engineering-level policy statement, not legal advice, and hasn't been reviewed by counsel.
