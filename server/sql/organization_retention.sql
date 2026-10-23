-- Applied to ResumeMatch production on 2026-10-24.
-- Organization owners can choose a retention window from 30 to 3650 days.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS retention_days integer NOT NULL DEFAULT 180
  CHECK (retention_days BETWEEN 30 AND 3650);
