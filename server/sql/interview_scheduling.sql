-- Applied to ResumeMatch production on 2026-10-24.
-- Recruiter-created one-person slots with public, non-guessable booking tokens.
CREATE TABLE IF NOT EXISTS public.interview_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  location text NOT NULL DEFAULT '',
  booking_token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'cancelled')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (starts_at > created_at - interval '1 minute')
);
CREATE INDEX IF NOT EXISTS interview_slots_job_idx ON public.interview_slots(job_id, starts_at);
CREATE INDEX IF NOT EXISTS interview_slots_token_idx ON public.interview_slots(booking_token);

CREATE TABLE IF NOT EXISTS public.interview_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL UNIQUE REFERENCES public.interview_slots(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE SET NULL,
  candidate_name text NOT NULL,
  candidate_email text NOT NULL,
  booked_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);
CREATE INDEX IF NOT EXISTS interview_bookings_org_idx ON public.interview_bookings(org_id, booked_at DESC);
ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members can read interview slots" ON public.interview_slots FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (select auth.uid()) AND profiles.org_id = interview_slots.org_id));
CREATE POLICY "org members can manage interview slots" ON public.interview_slots FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (select auth.uid()) AND profiles.org_id = interview_slots.org_id)) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (select auth.uid()) AND profiles.org_id = interview_slots.org_id));
CREATE POLICY "org members can read interview bookings" ON public.interview_bookings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (select auth.uid()) AND profiles.org_id = interview_bookings.org_id));
