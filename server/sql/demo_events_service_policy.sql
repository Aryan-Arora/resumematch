-- The API records anonymous demo telemetry with the service role. Keep the
-- table inaccessible to browser roles while making the intended server access
-- explicit so Supabase's security advisor can verify the policy exists.
CREATE POLICY "server may manage demo events"
  ON public.demo_events
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
