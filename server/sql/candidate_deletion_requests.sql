-- Applied to ResumeMatch production on 2026-10-24.
CREATE TABLE IF NOT EXISTS public.candidate_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.candidate_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members can read deletion requests"
  ON public.candidate_deletion_requests FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.org_id = candidate_deletion_requests.org_id
  ));
CREATE INDEX IF NOT EXISTS candidate_deletion_requests_org_status_idx
  ON public.candidate_deletion_requests (org_id, status, created_at DESC);
