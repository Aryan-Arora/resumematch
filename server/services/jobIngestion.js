import { supabase } from "../supabaseClient.js";
import { getEmbedding } from "./embedding.js";
import { fetchAdzunaJobs } from "./adzuna.js";

// Upsert normalized job postings into job_listings, embedding each one ONCE on
// fetch and reusing the stored vector on subsequent runs (the architecture
// doc's #1 NFR: "never re-embed the same document"). Dedupe key is
// (source, external_id); an existing posting is only re-embedded if its
// description text actually changed.
export async function upsertJobs(normalizedJobs) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const job of normalizedJobs) {
    const { data: existing } = await supabase
      .from("job_listings")
      .select("id, description, embedding")
      .eq("source", job.source)
      .eq("external_id", job.external_id)
      .maybeSingle();

    // Reuse the cached embedding unless this is new or the description changed.
    let embedding =
      existing?.embedding != null
        ? typeof existing.embedding === "string"
          ? JSON.parse(existing.embedding)
          : existing.embedding
        : null;
    const descriptionChanged = !existing || existing.description !== job.description;
    if (descriptionChanged && job.description) {
      embedding = await getEmbedding(job.description);
    }

    const row = { ...job, embedding, fetched_at: new Date().toISOString() };
    const { error } = await supabase
      .from("job_listings")
      .upsert(row, { onConflict: "source,external_id" });

    if (error) {
      skipped++;
      continue;
    }
    if (existing) updated++;
    else inserted++;
  }

  return { total: normalizedJobs.length, inserted, updated, skipped };
}

// Fetch + ingest from Adzuna for one or more search queries. Deliberately small
// and manual: the Adzuna free tier is ~1000 calls/month, so the seeker corpus
// is populated by controlled CLI runs (server/scripts/ingestJobs.js), not an
// unattended scheduler. `queries` is an array of strings or { what, where }.
export async function ingestFromAdzuna({ queries = [], country, pages = 1, resultsPerPage = 50 } = {}) {
  const summaries = [];
  for (const q of queries) {
    const what = typeof q === "string" ? q : q.what;
    const where = typeof q === "string" ? "" : q.where || "";
    for (let page = 1; page <= pages; page++) {
      const jobs = await fetchAdzunaJobs({ what, where, page, resultsPerPage, country });
      const summary = await upsertJobs(jobs);
      summaries.push({ what, where, page, ...summary });
      if (jobs.length === 0) break; // no more results — stop paging this query
    }
  }
  return summaries;
}
