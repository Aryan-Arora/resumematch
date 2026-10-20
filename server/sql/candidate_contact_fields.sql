-- Applied to production via Supabase migration: add_candidate_contact_fields
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text;

-- Applied to production via Supabase migration: add_candidate_parse_attempts
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS parse_attempts integer NOT NULL DEFAULT 0
  CHECK (parse_attempts >= 0 AND parse_attempts <= 10);
