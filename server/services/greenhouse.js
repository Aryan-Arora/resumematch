const GREENHOUSE_HOST = "harvest.greenhouse.io";

export function mapGreenhouseCandidates(candidates = []) {
  return candidates.map((candidate) => ({
    full_name: [candidate.first_name, candidate.last_name].filter(Boolean).join(" ").trim(),
    email: candidate.email_addresses?.find((item) => item.value)?.value || "",
    phone: candidate.phone_numbers?.find((item) => item.value)?.value || "",
    linkedin_url: candidate.social_media_addresses?.find((item) => /linkedin\.com/i.test(item.value || ""))?.value || "",
    recruiter_notes: candidate.custom_fields?.source ? `Greenhouse source: ${candidate.custom_fields.source}` : "",
    file_name: candidate.last_name && candidate.first_name ? `${candidate.first_name} ${candidate.last_name}` : `Greenhouse candidate ${candidate.id}`,
    greenhouse_id: candidate.id,
  }));
}

export async function fetchGreenhouseCandidates(apiKey, jobId) {
  if (typeof apiKey !== "string" || apiKey.length < 20) throw new Error("a valid Greenhouse API key is required");
  if (!/^\d+$/.test(String(jobId))) throw new Error("greenhouse_job_id must be numeric");
  const url = new URL(`https://${GREENHOUSE_HOST}/v1/candidates`);
  url.searchParams.set("job_id", String(jobId));
  url.searchParams.set("per_page", "100");
  const response = await fetch(url, { headers: { authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`, accept: "application/json", "user-agent": "ResumeMatch-Greenhouse/1.0" }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Greenhouse returned HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Greenhouse returned an invalid candidate list");
  return mapGreenhouseCandidates(data);
}

