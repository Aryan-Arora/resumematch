-- ============================================================================
-- ResumeMatch — seeker identity & resumes (migration 0004)  [M3]
-- ============================================================================
-- The seeker front door: an individual job seeker owns one or more resumes and
-- matches them against the job_listings corpus (0003). Seekers are ordinary
-- Supabase auth users with NO organization (the recruiter side is org-scoped;
-- the seeker side is per-user), so seeker endpoints require auth but not an org.
--
-- Consent is seeded now, off by default, so the future opt-in talent marketplace
-- (M6) never needs a retrofit: visible_to_recruiters gates whether a seeker's
-- resume can appear in recruiter searches. DPDP-style opt-in — nothing is
-- exposed until the seeker flips it on.
--
-- Apply after 0003_job_listings.sql. Not yet run against a live database.
-- ============================================================================

create table if not exists public.seeker_resumes (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references auth.users (id) on delete cascade,
  file_name             text,
  file_path             text,                    -- key in the "resumes" storage bucket (seeker/ prefix)
  resume_text           text,
  email                 text,
  embedding             vector(384),             -- all-MiniLM-L6-v2, same space as jobs
  unparseable           boolean not null default false,
  visible_to_recruiters boolean not null default false,  -- consent for the future marketplace (M6), opt-in
  created_at            timestamptz not null default now()
);

create index if not exists seeker_resumes_owner_idx on public.seeker_resumes (owner_id);
-- Supports the future marketplace (recruiter searches the opted-in seeker pool).
create index if not exists seeker_resumes_embedding_hnsw
  on public.seeker_resumes using hnsw (embedding vector_cosine_ops);

-- RLS (defense-in-depth; the API's service-role client bypasses it): a seeker
-- can only ever see/manage their own resumes.
alter table public.seeker_resumes enable row level security;
drop policy if exists seeker_resumes_owner on public.seeker_resumes;
create policy seeker_resumes_owner on public.seeker_resumes
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
