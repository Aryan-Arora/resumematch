# ResumeMatch screening upgrade plan

## Phase 1: safer screening (implemented

- Store structured job gates in `jobs.required_filters`.
- Store parser method, confidence, and warnings on every candidate.
- Evaluate mandatory evidence before ranking candidates.
- Route missing or ambiguous evidence to `needs_review`.
- Show gate evidence and parse confidence in the candidate detail panel.

## Phase 2: robust document intake

- Add OCR for scanned PDFs and image-only documents.
- Add a retryable parser worker and retain the original file.
- Detect columns, tables, headers, and repeated page furniture.
- Add a manual correction screen for low-confidence extraction.

## Phase 3: recruiter workflow

- Add candidate stages: New, Screening, Shortlisted, Interview, Offer, Rejected.
- Add notes, tags, ownership, bulk actions, and activity history.
- Add review filters for eligible, gate failed, and needs review.

## Phase 4: scheduling and communication

- Add Calendly or Google Calendar links first.
- Add editable shortlist, rejection, and interview email templates.
- Track delivery and recruiter actions without making hiring decisions automatically.

## Phase 5: quality and governance

- Add recruiter corrections and score calibration reports.
- Add model/version metadata to each screening run.
- Add audit exports and configurable retention controls.
- Keep human review required for ambiguous evidence and final decisions.
