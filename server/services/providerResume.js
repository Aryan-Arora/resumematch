const PROVIDER_HOSTS = {
  greenhouse: new Set(["harvest.greenhouse.io"]),
  lever: new Set(["api.lever.co", "hire.lever.co"]),
  workable: new Set(["www.workable.com", "apply.workable.com"]),
};
const MAX_BYTES = 10 * 1024 * 1024;

export function validateProviderResumeUrl(provider, rawUrl) {
  let url;
  try { url = new URL(String(rawUrl)); } catch { throw new Error("resume_url must be a valid URL"); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("resume_url must use https:// without credentials");
  if (!PROVIDER_HOSTS[provider]?.has(url.hostname.toLowerCase())) throw new Error("resume_url host is not allowed for this provider");
  return url;
}

export async function downloadProviderResume(provider, rawUrl, apiKey) {
  const url = validateProviderResumeUrl(provider, rawUrl);
  if (typeof apiKey !== "string" || apiKey.length < 16) throw new Error("a valid provider API key is required");
  const authorization = provider === "workable" ? `Bearer ${apiKey}` : `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
  const response = await fetch(url, { headers: { authorization, accept: "application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document", "user-agent": "ResumeMatch-ProviderResume/1.0" }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`provider returned HTTP ${response.status}`);
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_BYTES) throw new Error("provider resume exceeds the 10MB limit");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0 || buffer.length > MAX_BYTES) throw new Error("provider resume is empty or exceeds the 10MB limit");
  const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  const ext = contentType.includes("wordprocessingml") || /\.docx$/i.test(url.pathname) ? ".docx" : ".pdf";
  return { buffer, ext, fileName: decodeURIComponent(url.pathname.split("/").pop() || `provider-resume${ext}`).replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) };
}

