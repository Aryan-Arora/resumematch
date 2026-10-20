-- Evaluate auth.uid() once per statement instead of once per row. Access
-- predicates are unchanged; only the planner-friendly wrapper is different.
ALTER POLICY "applications_owner" ON public.applications
  USING (seeker_id = (select auth.uid()))
  WITH CHECK (seeker_id = (select auth.uid()));

ALTER POLICY "delete own org candidates" ON public.candidates
  USING (org_id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));
ALTER POLICY "insert own org candidates" ON public.candidates
  WITH CHECK (org_id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));
ALTER POLICY "select own org candidates" ON public.candidates
  USING (org_id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));
ALTER POLICY "update own org candidates" ON public.candidates
  USING (org_id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));

ALTER POLICY "users can insert own answers" ON public.interview_answers
  WITH CHECK (exists (select 1 from interview_sessions s where s.id = interview_answers.session_id and s.user_id = (select auth.uid())));
ALTER POLICY "users can read own answers" ON public.interview_answers
  USING (exists (select 1 from interview_sessions s where s.id = interview_answers.session_id and s.user_id = (select auth.uid())));
ALTER POLICY "users can insert own sessions" ON public.interview_sessions
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "users can read own sessions" ON public.interview_sessions
  USING ((select auth.uid()) = user_id);

ALTER POLICY "delete own org jobs" ON public.jobs
  USING (org_id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));
ALTER POLICY "insert own org jobs" ON public.jobs
  WITH CHECK (org_id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));
ALTER POLICY "select own org jobs" ON public.jobs
  USING (org_id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));
ALTER POLICY "update own org jobs" ON public.jobs
  USING (org_id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));

ALTER POLICY "select own organization" ON public.organizations
  USING (id = (select profiles.org_id from profiles where profiles.id = (select auth.uid())));
ALTER POLICY "insert own profile" ON public.profiles
  WITH CHECK (id = (select auth.uid()));
ALTER POLICY "select own profile" ON public.profiles
  USING (id = (select auth.uid()));
ALTER POLICY "update own profile" ON public.profiles
  USING (id = (select auth.uid()));
ALTER POLICY "seeker_resumes_owner" ON public.seeker_resumes
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));
