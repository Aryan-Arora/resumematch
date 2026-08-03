-- ============================================================================
-- ResumeMatch — seeker application tracker (migration 0005)  [M5]
-- ============================================================================
-- The PDF's Phase 2: "Jira for your job hunt." A seeker tracks jobs they've
-- saved from their matches through a Kanban pipeline. One row per (seeker, job);
-- saving a job again just updates its stage.
--
-- Apply after 0004_seeker.sql. Not yet run against a live database.
-- ============================================================================

create table if not exists public.applications (
  id             uuid primary key default gen_random_uuid(),
  seeker_id      uuid not null references auth.users (id) on delete cascade,
  job_listing_id uuid not null references public.job_listings (id) on delete cascade,
  status         text not null default 'saved'
                 check (status in ('saved', 'applied', 'interviewing', 'offer', 'rejected')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (seeker_id, job_listing_id)
);

create index if not exists applications_seeker_idx on public.applications (seeker_id);

-- RLS (defense-in-depth; the API's service-role client bypasses it): a seeker
-- can only ever see/manage their own tracked applications.
alter table public.applications enable row level security;
drop policy if exists applications_owner on public.applications;
create policy applications_owner on public.applications
  for all
  using (seeker_id = auth.uid())
  with check (seeker_id = auth.uid());
