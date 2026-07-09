const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4100/api";
const AUTH_KEY_STORAGE = "resumematch_api_key";

export function getStoredApiKey() {
  return localStorage.getItem(AUTH_KEY_STORAGE) || "";
}

export function setStoredApiKey(key) {
  localStorage.setItem(AUTH_KEY_STORAGE, key);
}

export function clearStoredApiKey() {
  localStorage.removeItem(AUTH_KEY_STORAGE);
}

function authHeaders() {
  const key = getStoredApiKey();
  return key ? { "x-api-key": key } : {};
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function checkAuth(key) {
  return fetch(`${API_BASE}/auth/check`, {
    headers: key ? { "x-api-key": key } : {},
  });
}

export function getJobs() {
  return fetch(`${API_BASE}/jobs`, { headers: authHeaders() }).then(handle);
}

export function getAnalytics() {
  return fetch(`${API_BASE}/analytics`, { headers: authHeaders() }).then(handle);
}

export function createJob(title, description) {
  return fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title, description }),
  }).then(handle);
}

export function uploadCandidates(jobId, files) {
  const formData = new FormData();
  for (const file of files) formData.append("resumes", file);
  return fetch(`${API_BASE}/jobs/${jobId}/candidates`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  }).then(handle);
}

export function getCandidates(jobId) {
  return fetch(`${API_BASE}/jobs/${jobId}/candidates`, { headers: authHeaders() }).then(handle);
}

export function deleteCandidate(candidateId) {
  return fetch(`${API_BASE}/candidates/${candidateId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => {
    if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
  });
}

export async function downloadExport(jobId, jobTitle) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/export`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `candidates-${(jobTitle || jobId).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function getSkillTaxonomy() {
  return fetch(`${API_BASE}/skill-taxonomy`, { headers: authHeaders() }).then(handle);
}

export function deleteJob(jobId) {
  return fetch(`${API_BASE}/jobs/${jobId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => {
    if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
  });
}
