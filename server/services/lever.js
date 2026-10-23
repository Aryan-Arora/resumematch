const LEVER_HOST = "api.lever.co";

export function mapLeverOpportunities(opportunities = []) {
  return opportunities.map((item) => ({
    full_name: item.name || "",
    email: Array.isArray(item.emails) ? item.emails[0] || "" : "",
    phone: Array.isArray(item.phones) ? item.phones[0] || "" : "",
    linkedin_url: Array.isArray(item.links) ? item.links.find((link) => /linkedin\.com/i.test(link || "")) || "" : "",
    recruiter_notes: item.headline ? `Lever headline: ${item.headline}` : "",
    file_name: item.name || `Lever opportunity ${item.id}`,
    lever_id: item.id,
  }));
}

export async function fetchLeverOpportunities(apiKey, postingId) {
  if (typeof apiKey !== "string" || apiKey.length < 16) throw new Error("a valid Lever API key is required");
  if (typeof postingId !== "string" || !/^[a-zA-Z0-9_-]{4,200}$/.test(postingId)) throw new Error("lever_posting_id is invalid");
  const url = new URL(`https://${LEVER_HOST}/v1/opportunities`);
  url.searchParams.set("posting", postingId);
  url.searchParams.set("limit", "100");
  const response = await fetch(url, { headers: { authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`, accept: "application/json", "user-agent": "ResumeMatch-Lever/1.0" }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Lever returned HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.data)) throw new Error("Lever returned an invalid opportunity list");
  return mapLeverOpportunities(data.data);
}

