-- ============================================================================
-- ResumeMatch — baseline schema (migration 0001)
-- ============================================================================
-- The project was originally built against a hand-created Supabase schema with
-- NO committed migration (the README told you to "recreate from
-- server/routes/*.js"). This file captures that schema from the application
-- query code so the database can be reproduced from source.
--
-- Source of truth for this reconstruction:
--   server/routes/{jobs,candidates,organizations,auth,analytics}.js
--   server/middleware/auth.js, server/services/{embedding,retention}.js
--   server/routes/jobs.js  -> jobs + candidates inserts/updates
--   PostgREST embedded joins ("*, jobs(title)", "organizations(name)") confirm
--   the foreign keys below actually exist in the live database.
--
-- REVIEW BEFORE TRUSTING: score columns (double precision) and the presence of
-- created_at on organizations/profiles are INFERRED from usage, not observed in
-- a live dump. Column nullability follows the app's insert-then-update pattern
-- (a candidate row is inserted with only job_id/org_id/file_*/status, then
-- filled in by the background processor, so most columns must be nullable).
-- This DDL has not yet been executed against a live Postgres — apply it to a
-- throwaway project first and diff against production before adopting it.
--
-- Safe to run on an empty Supabase project (Supabase SQL editor or psql).
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists vector;    -- pgvector: the jd_embedding / resume_embedding columns
create extension if not exists pgcrypto;  -- gen_random_uuid() (available by default on Supabase)

-- organizations --------------------------------------------------------------
-- A workspace. Members join by typing the 8-char join_code (see organizations.js).
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  join_code  text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- profiles -------------------------------------------------------------------
-- One row per Supabase auth user, mapping the user to their organization.
-- The row id IS the auth user id (upserted on org create/join in organizations.js).
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  org_id     uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists profiles_org_id_idx on public.profiles (org_id);

-- jobs -----------------------------------------------------------------------
-- A job description. jd_embedding is the all-MiniLM-L6-v2 document vector
-- (embedding.js warns this model — hence the 384 dims — must never change
-- without a migration, since the vectors are persisted).
create table if not exists public.jobs (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  title        text not null,
  description  text not null,
  jd_embedding vector(384),
  jd_skills    text[],
  jd_domain    text,
  created_at   timestamptz not null default now()
);
create index if not exists jobs_org_id_idx on public.jobs (org_id);
create index if not exists jobs_created_at_idx on public.jobs (created_at);  -- retention sweep filters on this

-- candidates -----------------------------------------------------------------
-- One uploaded resume. Inserted with only job_id/org_id/file_name/file_path/
-- status='queued'; the rest is filled in by the background processor
-- (jobs.js processCandidate), which is why almost everything here is nullable.
create table if not exists public.candidates (
  id                      uuid primary key default gen_random_uuid(),
  -- Nullable on purpose: a starred candidate is DETACHED (job_id -> null) when
  -- its job is deleted or expires, so the CV survives in the starred pool.
  -- See deleteJobCascade() in server/routes/jobs.js.
  job_id                  uuid references public.jobs (id) on delete set null,
  org_id                  uuid not null references public.organizations (id) on delete cascade,
  file_name               text,
  file_path               text,        -- key in the "resumes" storage bucket
  status                  text not null default 'queued',  -- 'queued' | 'done' | 'failed'
  unparseable             boolean not null default false,
  error_message           text,
  resume_text             text,
  email                   text,
  resume_embedding        vector(384),
  matched_skills          text[],
  missing_skills          text[],
  implied_skills          text[],
  implied_skill_evidence  jsonb,       -- { "<skill>": "<evidence sentence from the resume>" }
  semantic_score          double precision,
  skill_score             double precision,
  final_score             double precision,
  starred                 boolean not null default false,
  starred_at              timestamptz,
  starred_job_title       text,        -- title snapshot kept when detached from a deleted job
  shortlisted             boolean not null default false,
  shortlisted_at          timestamptz,
  shortlist_email_sent_at timestamptz,
  created_at              timestamptz not null default now()
);
create index if not exists candidates_job_id_idx on public.candidates (job_id);
create index if not exists candidates_org_id_idx on public.candidates (org_id);
create index if not exists candidates_status_idx on public.candidates (status);  -- recovery sweep filters status='queued'
-- Candidates are listed ORDER BY final_score desc within a job (jobs.js).
create index if not exists candidates_job_score_idx
  on public.candidates (job_id, final_score desc nulls last);

-- ----------------------------------------------------------------------------
-- Row Level Security (defense-in-depth)
-- ----------------------------------------------------------------------------
-- The server talks to Supabase with the SERVICE ROLE key, which BYPASSES RLS —
-- so these policies do not affect the API at all. They only matter if something
-- ever queries these tables with a user JWT (e.g. the anon client, which today
-- is used only for auth). They are reconstructed to match the README's stated
-- intent ("every query filtered by the requester's org_id"); review them against
-- your real policies. Enabling RLS here is safe for the running app.
alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.jobs          enable row level security;
alter table public.candidates    enable row level security;

-- A user manages only their own profile row.
create policy profiles_self on public.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- A user can see the organization they belong to.
create policy organizations_member_read on public.organizations
  for select
  using (id = (select p.org_id from public.profiles p where p.id = auth.uid()));

-- Jobs and candidates are scoped to the requester's organization.
create policy jobs_org_scope on public.jobs
  for all
  using (org_id = (select p.org_id from public.profiles p where p.id = auth.uid()))
  with check (org_id = (select p.org_id from public.profiles p where p.id = auth.uid()));

create policy candidates_org_scope on public.candidates
  for all
  using (org_id = (select p.org_id from public.profiles p where p.id = auth.uid()))
  with check (org_id = (select p.org_id from public.profiles p where p.id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Storage bucket for uploaded resumes (private; served via 60s signed URLs)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;
