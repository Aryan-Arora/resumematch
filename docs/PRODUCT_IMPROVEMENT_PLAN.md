# ResumeMatch product improvement plan

## Product goal

Make ResumeMatch a trustworthy recruiter workspace, not just a resume scoring page. Every recommendation should be inspectable, uncertain cases should go to human review, and recruiters should be able to move from screening to interview without leaving the product.

## Current baseline

- Explainable semantic and skill matching
- Must-have, preferred, and disqualifying requirements
- Eligibility states and parser confidence warnings
- Candidate search, comparison, Kanban stages, notes, tags, reminders
- Resend shortlist, interview, and rejection emails
- Supabase persistence and Fly/Vercel deployment

## Priority 1 — make the review loop excellent

### Side-by-side comparison

- Compare up to four candidates.
- Show score components, eligibility evidence, missing requirements, uncertainty, and recruiter feedback.
- Acceptance: a recruiter can decide why one candidate is stronger without opening multiple resumes.

### Structured requirements editor

- Add certification, license, location, work authorization, salary, notice period, and experience fields.
- Distinguish required, preferred, and disqualifying requirements.
- Acceptance: a recruiter can edit extracted requirements before screening begins.

### Review queue

- Saved views for Needs review, Eligible, Gate failed, and Follow up today.
- Search across candidate name, email, skills, tags, notes, and projects.
- Acceptance: a recruiter can find every candidate needing action in under two clicks.

## Priority 2 — team workflow

### Assignments and permissions

- Expose organization members in a scoped member directory.
- Add assignment picker and role-based permissions.
- Record assignment changes in the activity log.

### Pipeline productivity

- Kanban drag-and-drop with keyboard-accessible stage controls.
- Bulk stage, tag, assign, email, and export actions.
- Reminder queue and overdue indicators.

### Communication

- Editable per-job templates with preview and variables.
- Resend delivery status and failure details.
- Interview link insertion and calendar integration.

## Priority 3 — data quality and trust

### Parsing

- Normalize columns, tables, headers, and multi-page documents.
- Add OCR for image-only PDFs as a provider behind the existing OCR boundary.
- Add manual correction for low-confidence extraction.
- Acceptance: scanned, two-column, and standard resumes each produce an explicit confidence result.

### AI governance

- Store model version and screening configuration for every candidate.
- Capture recruiter feedback as accurate, inaccurate, or unclear.
- Add calibration report comparing AI recommendations with recruiter outcomes.
- Never turn unclear evidence into an automatic rejection.

### Audit and retention

- Candidate activity timeline and downloadable audit export.
- Configurable retention and deletion controls.
- Verify organization scoping and storage access with negative tests.

## Priority 4 — integrations and growth

- CSV import/export first, then Greenhouse, Lever, and Workable connectors.
- Webhooks and a documented API.
- Searchable talent pools across projects.
- Calendar integration and candidate self-scheduling.

## Quality gates for every release

- Unit and integration tests pass.
- Production build passes.
- Browser smoke test covers sign-in, create job, upload, review, stage update, email action, and export.
- Test fixtures include standard, two-column, scanned, malformed, and duplicate resumes.
- No release until API health, database migrations, CORS, storage, and email configuration are verified.

## Recommended next sprint

1. Organization member directory and assignment picker.
2. Editable email-template settings with preview.
3. Review queue saved views and overdue reminders.
4. Audit export and calibration report foundation.
5. OCR provider selection and scanned-resume fixture testing.

## Definition of a 10/10 release

A recruiter can create a structured role, screen mixed-format resumes, understand every recommendation, assign and review candidates with teammates, communicate and schedule interviews, audit decisions, and reuse candidates across roles without leaving ResumeMatch.
