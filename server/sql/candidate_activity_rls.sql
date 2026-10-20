-- Review and apply through Supabase after confirming the organization policy.
-- The API uses the service role, so these policies protect direct client access
-- without blocking server-side audit writes.
ALTER TABLE public.candidate_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can read candidate activity"
  ON public.candidate_activity FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.org_id = candidate_activity.org_id
  ));

CREATE POLICY "org members can insert candidate activity"
  ON public.candidate_activity FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.org_id = candidate_activity.org_id
  ));
