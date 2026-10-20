-- Applied to production via Supabase migration: add_candidate_contact_fields
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text;
