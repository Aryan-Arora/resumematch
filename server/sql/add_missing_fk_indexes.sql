-- Cover foreign-key lookups reported by the Supabase performance advisor.
CREATE INDEX IF NOT EXISTS applications_job_listing_id_idx
  ON public.applications (job_listing_id);

CREATE INDEX IF NOT EXISTS interview_answers_session_id_idx
  ON public.interview_answers (session_id);

CREATE INDEX IF NOT EXISTS interview_sessions_user_id_idx
  ON public.interview_sessions (user_id);

CREATE INDEX IF NOT EXISTS organizations_created_by_idx
  ON public.organizations (created_by);

CREATE INDEX IF NOT EXISTS profiles_org_id_idx
  ON public.profiles (org_id);
