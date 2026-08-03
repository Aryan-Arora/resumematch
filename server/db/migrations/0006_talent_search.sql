-- ============================================================================
-- ResumeMatch — talent marketplace search (migration 0006)  [M6]
-- ============================================================================
-- The PDF's Feature E, consent-first: a recruiter searches the pool of seekers
-- who have OPTED IN (seeker_resumes.visible_to_recruiters = true) and gets
-- anonymized, fit-ranked results. This closes the two-sided loop — the seeker
-- pool the app now grows becomes the recruiter's talent pool.
--
-- match_seekers returns ONLY id + similarity: no name, email, or resume text.
-- Anonymized presentation and (later) a double-blind contact-unlock flow live in
-- the API/UI layer; the consent gate is enforced right here in the query.
--
-- Apply after 0005_applications.sql. Not yet run against a live database.
-- ============================================================================

create or replace function public.match_seekers(
  query_embedding vector(384),
  match_count     int default 20
)
returns table (
  id         uuid,
  similarity double precision
)
language sql
stable
as $$
  select
    s.id,
    1 - (s.embedding <=> query_embedding) as similarity
  from public.seeker_resumes s
  where s.visible_to_recruiters = true   -- consent gate: opt-in only
    and s.embedding is not null
  order by s.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
