-- Applied to production via Supabase migration: add_recruiter_query_indexes
CREATE INDEX IF NOT EXISTS candidate_activity_org_id_idx ON public.candidate_activity (org_id);
CREATE INDEX IF NOT EXISTS candidate_activity_actor_id_idx ON public.candidate_activity (actor_id);
CREATE INDEX IF NOT EXISTS candidates_assigned_to_idx ON public.candidates (assigned_to);
CREATE INDEX IF NOT EXISTS candidates_org_id_idx ON public.candidates (org_id);
CREATE INDEX IF NOT EXISTS candidates_org_created_at_idx ON public.candidates (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS candidates_org_pipeline_stage_idx ON public.candidates (org_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS candidates_org_eligibility_status_idx ON public.candidates (org_id, eligibility_status);
CREATE INDEX IF NOT EXISTS jobs_org_id_idx ON public.jobs (org_id);
