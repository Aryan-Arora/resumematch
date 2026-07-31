import { supabase } from "../supabaseClient.js";

// Live nearest-neighbor search over stored resume embeddings using pgvector's
// cosine distance operator (<=>), via the match_candidates RPC defined in
// server/db/migrations/0002_vector_search.sql.
//
// This is the "query" counterpart to the frozen per-upload semantic_score:
// given ANY 384-dim embedding (a pasted JD, or an existing job's jd_embedding),
// it ranks an org's whole candidate pool by semantic similarity — the primitive
// behind cross-job talent rediscovery. The seeker side will invert the same idea
// (resume embedding -> ranked jobs) once a job corpus exists (M2).
export async function searchCandidatesByEmbedding(embedding, orgId, options = {}) {
  const { limit = 20, excludeJobId = null } = options;

  // Embeddings selected back from Postgres arrive as a JSON string (see the
  // toVector() guard in embedding.js); the RPC's query_embedding is vector(384)
  // and expects a numeric array, so normalize before sending.
  const queryEmbedding = typeof embedding === "string" ? JSON.parse(embedding) : embedding;

  const { data, error } = await supabase.rpc("match_candidates", {
    query_embedding: queryEmbedding,
    match_org_id: orgId,
    match_count: limit,
    exclude_job_id: excludeJobId,
  });
  if (error) throw error;
  return data;
}
