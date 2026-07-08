const API_BASE = "http://localhost:4100/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function getJobs() {
  return fetch(`${API_BASE}/jobs`).then(handle);
}

export function getAnalytics() {
  return fetch(`${API_BASE}/analytics`).then(handle);
}

export function createJob(title, description) {
  return fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  }).then(handle);
}

export function uploadCandidates(jobId, files) {
  const formData = new FormData();
  for (const file of files) formData.append("resumes", file);
  return fetch(`${API_BASE}/jobs/${jobId}/candidates`, {
    method: "POST",
    body: formData,
  }).then(handle);
}

export function getCandidates(jobId) {
  return fetch(`${API_BASE}/jobs/${jobId}/candidates`).then(handle);
}

export function deleteCandidate(candidateId) {
  return fetch(`${API_BASE}/candidates/${candidateId}`, { method: "DELETE" }).then((res) => {
    if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
  });
}

export function exportUrl(jobId) {
  return `${API_BASE}/jobs/${jobId}/export`;
}

export function getSkillTaxonomy() {
  return fetch(`${API_BASE}/skill-taxonomy`).then(handle);
}
