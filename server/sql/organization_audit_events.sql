-- Applied to ResumeMatch production on 2026-10-24.
CREATE TABLE IF NOT EXISTS public.organization_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  candidate_id uuid,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organization_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members can read organization audit"
  ON public.organization_audit_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.org_id = organization_audit_events.org_id
  ));
CREATE INDEX IF NOT EXISTS organization_audit_events_org_created_idx ON public.organization_audit_events (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS organization_audit_events_candidate_idx ON public.organization_audit_events (candidate_id, created_at DESC);
