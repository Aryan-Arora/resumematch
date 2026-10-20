-- Prevent role-controlled search_path resolution in the vector match helpers.
-- The functions only reference public tables, so pinning the path is safe.
ALTER FUNCTION public.match_jobs(vector, integer, double precision)
  SET search_path = public;

ALTER FUNCTION public.match_seekers(vector, integer)
  SET search_path = public;
