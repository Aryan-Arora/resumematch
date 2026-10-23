const WORKABLE_HOST = "www.workable.com";

export function mapWorkableCandidates(candidates = []) {
  return candidates.map((item) => ({
    full_name: item.name || [item.firstname, item.lastname].filter(Boolean).join(" ").trim(),
    email: item.email || "",
    phone: item.phone || "",
    linkedin_url: item.social_profiles?.find((profile) => /linkedin\.com/i.test(profile.url || profile))?.url || item.linkedin_profile || "",
    recruiter_notes: item.headline ? `Workable headline: ${item.headline}` : "",
    file_name: item.name || `Workable candidate ${item.id}`,
    workable_id: item.id,
  }));
}

export async function fetchWorkableCandidates(apiKey, account, shortcode) {
  if (typeof apiKey !== "string" || apiKey.length < 16) throw new Error("a valid Workable API key is required");
  if (typeof account !== "string" || !/^[a-z0-9][a-z0-9-]{1,80}$/i.test(account)) throw new Error("workable_account is invalid");
  if (typeof shortcode !== "string" || !/^[a-z0-9_-]{2,120}$/i.test(shortcode)) throw new Error("workable_job_shortcode is invalid");
  const url = new URL(`https://${WORKABLE_HOST}/spi/v3/accounts/${encodeURIComponent(account)}/candidates`);
  url.searchParams.set("shortcode", shortcode);
  const response = await fetch(url, { headers: { authorization: `Bearer ${apiKey}`, accept: "application/json", "user-agent": "ResumeMatch-Workable/1.0" }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Workable returned HTTP ${response.status}`);
  const data = await response.json();
  const candidates = Array.isArray(data) ? data : data.candidates;
  if (!Array.isArray(candidates)) throw new Error("Workable returned an invalid candidate list");
  return mapWorkableCandidates(candidates);
}

