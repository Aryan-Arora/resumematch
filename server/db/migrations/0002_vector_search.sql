-- ============================================================================
-- ResumeMatch — vector search foundation (migration 0002)  [M1]
-- ============================================================================
-- Turns pgvector from a storage type into a live SEARCH engine.
--
-- Until now the app computed cosine similarity in JavaScript, once, at upload
-- time, and froze it into candidates.semantic_score; ranking was ORDER BY
-- final_score. That cannot answer "given this JD, find the best matches across
-- ALL candidates" (cross-job talent rediscovery) or, later, "given this resume,
-- find the best jobs" (the seeker side). Both are nearest-neighbor queries.
--
-- This migration adds:
--   1. HNSW cosine indexes on the embedding columns (fast approximate NN).
--   2. match_candidates(): rank an org's candidate pool against a query vector.
--
-- The existing frozen semantic_score path is untouched and keeps working — this
-- is purely additive and backward-compatible.
--
-- Requires pgvector >= 0.5.0 (for HNSW); Supabase supports it. Apply after
-- 0001_baseline_schema.sql. NOTE: not yet run against a live database — test on
-- a throwaway project first.
-- ============================================================================

-- 1. Approximate-nearest-neighbor indexes (cosine distance) -------------------
-- HNSW builds on empty or populated tables, needs no training, and gives strong
-- recall/latency for 384-dim vectors. vector_cosine_ops matches the <=> queries
-- below (and the normalized embeddings the app already produces in embedding.js).
create index if not exists candidates_resume_embedding_hnsw
  on public.candidates using hnsw (resume_embedding vector_cosine_ops);

create index if not exists jobs_jd_embedding_hnsw
  on public.jobs using hnsw (jd_embedding vector_cosine_ops);

-- 2. match_candidates(): live talent search over an org's pool ----------------
-- Returns the org's candidates ranked by cosine similarity to query_embedding.
-- similarity = 1 - cosine_distance, so higher is better (1.0 == identical).
-- Org scoping is explicit (the API's service-role client bypasses RLS), and
-- rows without an embedding (still-queued / unparseable resumes) are skipped.
create or replace function public.match_candidates(
  query_embedding vector(384),
  match_org_id    uuid,
  match_count     int  default 20,
  exclude_job_id  uuid default null
)
returns table (
  id          uuid,
  job_id      uuid,
  file_name   text,
  email       text,
  final_score double precision,
  similarity  double precision
)
language sql
stable
as $$
  select
    c.id,
    c.job_id,
    c.file_name,
    c.email,
    c.final_score,
    1 - (c.resume_embedding <=> query_embedding) as similarity
  from public.candidates c
  where c.org_id = match_org_id
    and c.resume_embedding is not null
    and (exclude_job_id is null or c.job_id is distinct from exclude_job_id)
  order by c.resume_embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

-- NOTE (M2/M4): the seeker direction adds a match_jobs() twin over the incoming
-- job_listings corpus (resume embedding -> ranked jobs). It is intentionally not
-- created here because that table does not exist yet — it ships with the job
-- ingestion migration. Same engine, query reversed.
