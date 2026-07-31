-- ============================================================================
-- ResumeMatch — job corpus + seeker-side search (migration 0003)  [M2]
-- ============================================================================
-- Adds the INPUT side of the seeker direction: a corpus of real job postings to
-- match a resume against, plus the match_jobs() RPC (the seeker-side twin of
-- match_candidates from 0002 — same engine, query reversed).
--
-- Jobs are ingested from external sources (Adzuna first; Greenhouse/Lever ATS
-- feeds later) by server/scripts/ingestJobs.js, embedded ONCE on fetch and
-- cached here (the architecture doc's #1 NFR: never re-embed the same document).
--
-- Unlike the recruiter-side `jobs` table, job_listings are GLOBAL (not org
-- scoped) — they are public postings any seeker can match against.
--
-- Apply after 0002_vector_search.sql. Not yet run against a live database.
-- ============================================================================

create table if not exists public.job_listings (
  id          uuid primary key default gen_random_uuid(),
  source      text not null,                    -- 'adzuna' | 'greenhouse' | 'lever'
  external_id text not null,                    -- the posting's id at the source
  title       text not null,
  company     text,
  location    text,
  description text,                             -- snippet (Adzuna) or full text (ATS feeds)
  url         text,                             -- apply / redirect URL
  -- Drives ranking: full-text postings outrank snippet-only ones (the doc says
  -- to "weight full-text matches above snippet matches" — Adzuna gives snippets).
  source_type text not null default 'snippet',  -- 'snippet' | 'full_text'
  remote      boolean,
  salary_min  double precision,
  salary_max  double precision,
  category    text,
  embedding   vector(384),                      -- all-MiniLM-L6-v2, cached on fetch
  posted_at   timestamptz,
  fetched_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  -- Dedupe key: re-ingesting the same posting updates the row instead of
  -- inserting a duplicate (and lets ingestion skip re-embedding unchanged text).
  unique (source, external_id)
);

create index if not exists job_listings_embedding_hnsw
  on public.job_listings using hnsw (embedding vector_cosine_ops);
create index if not exists job_listings_source_idx on public.job_listings (source);

-- match_jobs(): seeker-side search — given a resume embedding, rank the job
-- corpus by semantic similarity, down-weighting snippet-only sources.
create or replace function public.match_jobs(
  query_embedding vector(384),
  match_count     int              default 20,
  snippet_weight  double precision default 0.9
)
returns table (
  id                  uuid,
  source              text,
  external_id         text,
  title               text,
  company             text,
  location            text,
  url                 text,
  source_type         text,
  similarity          double precision,
  weighted_similarity double precision
)
language sql
stable
as $$
  -- Over-fetch the nearest neighbors via the HNSW index (raw cosine distance),
  -- then re-rank that shortlist so full-text listings outrank snippet-only ones.
  select * from (
    select
      j.id, j.source, j.external_id, j.title, j.company, j.location, j.url, j.source_type,
      1 - (j.embedding <=> query_embedding) as similarity,
      (1 - (j.embedding <=> query_embedding))
        * (case when j.source_type = 'full_text' then 1.0 else snippet_weight end)
        as weighted_similarity
    from public.job_listings j
    where j.embedding is not null
    order by j.embedding <=> query_embedding
    limit greatest(match_count, 1) * 3
  ) shortlist
  order by shortlist.weighted_similarity desc
  limit greatest(match_count, 1);
$$;
