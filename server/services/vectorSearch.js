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

// Seeker-side twin of searchCandidatesByEmbedding: given a resume embedding,
// rank the ingested public job corpus (job_listings) by semantic similarity,
// down-weighting snippet-only sources vs full-text per the architecture doc.
// Same engine, query reversed — this powers the seeker UI (M4). Backed by the
// match_jobs RPC in server/db/migrations/0003_job_listings.sql.
export async function searchJobsByEmbedding(embedding, options = {}) {
  const { limit = 20, snippetWeight = 0.9 } = options;
  const queryEmbedding = typeof embedding === "string" ? JSON.parse(embedding) : embedding;

  const { data, error } = await supabase.rpc("match_jobs", {
    query_embedding: queryEmbedding,
    match_count: limit,
    snippet_weight: snippetWeight,
  });
  if (error) throw error;
  return data;
}
