// Adzuna job-search API client. Adzuna aggregates listings from thousands of
// sources across many countries under one API key, but returns only a SNIPPET
// of each description (hence source_type: "snippet" below, which the ranking
// down-weights vs full-text ATS feeds). Free tier is ~1000 calls/month, so
// ingestion is a controlled/manual operation (see server/scripts/ingestJobs.js).
//
// Docs: https://developer.adzuna.com/

const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs";

function credentials() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    const err = new Error(
      "ADZUNA_APP_ID / ADZUNA_APP_KEY are not set — add them to the server .env to ingest Adzuna jobs."
    );
    err.status = 503;
    throw err;
  }
  return { appId, appKey };
}

// Map one raw Adzuna result to the normalized job_listings shape. Pure function
// (no network, no env) so it is unit-testable — see adzuna.test.js.
export function mapAdzunaJob(raw) {
  const locationName = raw.location?.display_name || null;
  return {
    source: "adzuna",
    external_id: String(raw.id),
    title: raw.title || "",
    company: raw.company?.display_name || null,
    location: locationName,
    description: raw.description || "",
    url: raw.redirect_url || null,
    // Adzuna only ever returns a snippet of the description.
    source_type: "snippet",
    remote: /\bremote\b/i.test(`${raw.title || ""} ${locationName || ""}`) || null,
    salary_min: raw.salary_min ?? null,
    salary_max: raw.salary_max ?? null,
    category: raw.category?.label || null,
    posted_at: raw.created || null,
  };
}

// Fetch one page of Adzuna results for a query, normalized. `country` is an
// Adzuna country code (us, gb, in, ca, au, ...). Throws (with .status) on a
// non-2xx response so the caller can surface a clean error.
export async function fetchAdzunaJobs({
  what = "",
  where = "",
  page = 1,
  resultsPerPage = 50,
  country = process.env.ADZUNA_COUNTRY || "us",
} = {}) {
  const { appId, appKey } = credentials();
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(resultsPerPage),
    "content-type": "application/json",
  });
  if (what) params.set("what", what);
  if (where) params.set("where", where);

  const url = `${ADZUNA_BASE}/${country}/search/${page}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`Adzuna request failed (${res.status}): ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return (data.results || []).map(mapAdzunaJob);
}
