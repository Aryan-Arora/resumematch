import { supabase } from "./supabaseClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4100/api";

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getJobs() {
  return fetch(`${API_BASE}/jobs`, { headers: await authHeaders() }).then(handle);
}

export async function getAnalytics() {
  return fetch(`${API_BASE}/analytics`, { headers: await authHeaders() }).then(handle);
}

export async function createJob(title, description, domain) {
  return fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ title, description, domain: domain || undefined }),
  }).then(handle);
}

export async function uploadCandidates(jobId, files) {
  const formData = new FormData();
  for (const file of files) formData.append("resumes", file);
  return fetch(`${API_BASE}/jobs/${jobId}/candidates`, {
    method: "POST",
    headers: await authHeaders(),
    body: formData,
  }).then(handle);
}

export async function getUploadStatus(jobId) {
  return fetch(`${API_BASE}/jobs/${jobId}/candidates/status`, {
    headers: await authHeaders(),
  }).then(handle);
}

export async function getCandidates(jobId) {
  return fetch(`${API_BASE}/jobs/${jobId}/candidates`, { headers: await authHeaders() }).then(
    handle
  );
}

export async function viewResume(candidateId) {
  const { url } = await fetch(`${API_BASE}/candidates/${candidateId}/resume`, {
    headers: await authHeaders(),
  }).then(handle);
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function deleteCandidate(candidateId) {
  return fetch(`${API_BASE}/candidates/${candidateId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  }).then((res) => {
    if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
  });
}

export async function downloadExport(jobId, jobTitle) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/export`, { headers: await authHeaders() });
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

export async function viewComplianceNotice(jobId, semanticWeight) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/compliance-notice?semanticWeight=${semanticWeight}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Compliance notice failed with status ${res.status}`);
  const html = await res.text();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function getSkillTaxonomy(domain) {
  const qs = domain ? `?domain=${encodeURIComponent(domain)}` : "";
  return fetch(`${API_BASE}/skill-taxonomy${qs}`, { headers: await authHeaders() }).then(handle);
}

export async function getJobDomains() {
  return fetch(`${API_BASE}/jobs/domains`, { headers: await authHeaders() }).then(handle);
}

export async function deleteJob(jobId) {
  return fetch(`${API_BASE}/jobs/${jobId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  }).then((res) => {
    if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
  });
}
