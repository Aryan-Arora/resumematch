import { supabase } from "./supabaseClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4100/api";

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// A 401 means the session we're holding is no longer valid (expired,
// user deleted, etc). Without this, the app is stuck showing a raw
// "unauthorized" error with no way back to the login screen — this clears
// the stale session and reloads so AuthGate renders the login form again.
async function handle(res) {
  if (res.status === 401) {
    await supabase.auth.signOut();
    window.location.reload();
    throw new Error("Session expired — signing out.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const requestId = res.headers.get("x-request-id");
    const message = body.error || `Request failed with status ${res.status}`;
    throw new Error(requestId ? `${message} (Reference: ${requestId})` : message);
  }
  return res.json();
}

export async function getMyOrganization() {
  return fetch(`${API_BASE}/organizations/me`, { headers: await authHeaders() }).then(handle);
}

export async function updateOrganizationSettings(settings) {
  return fetch(`${API_BASE}/organizations/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(settings),
  }).then(handle);
}

export async function getDeletionRequests() {
  return fetch(`${API_BASE}/organizations/deletion-requests`, { headers: await authHeaders() }).then(handle);
}

export async function updateDeletionRequest(id, status) {
  return fetch(`${API_BASE}/organizations/deletion-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ status }),
  }).then(handle);
}

export async function downloadOrganizationExport() {
  const res = await fetch(`${API_BASE}/organizations/export`, { headers: await authHeaders() });
  if (!res.ok) return handle(res);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `resumematch-organization-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function getOrganizationMembers() {
  return fetch(`${API_BASE}/organizations/members`, { headers: await authHeaders() }).then(handle);
}

export async function getOrganizationWebhooks() {
  return fetch(`${API_BASE}/organizations/webhooks`, { headers: await authHeaders() }).then(handle);
}

export async function createOrganizationWebhook(payload) {
  return fetch(`${API_BASE}/organizations/webhooks`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify(payload) }).then(handle);
}

export async function deleteOrganizationWebhook(id) {
  return fetch(`${API_BASE}/organizations/webhooks/${id}`, { method: "DELETE", headers: await authHeaders() }).then(handle);
}

export async function getWebhookDeliveries() {
  return fetch(`${API_BASE}/organizations/webhooks/deliveries`, { headers: await authHeaders() }).then(handle);
}

export async function importProviderCandidates(jobId, provider, payload) {
  return fetch(`${API_BASE}/jobs/${jobId}/integrations/${provider}/candidates/import`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify(payload) }).then(handle);
}

export async function createOrganization(name) {
  return fetch(`${API_BASE}/organizations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ name }),
  }).then(handle);
}

export async function joinOrganization(code) {
  return fetch(`${API_BASE}/organizations/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ code }),
  }).then(handle);
}

// Unauthenticated — no session token needed.
export async function classifyPreview(description) {
  return fetch(`${API_BASE}/public/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  }).then(handle);
}

// Unauthenticated — no session token needed. Resumes are scored in memory on
// the server and never stored; up to 3 at a time (more requires signing up).
export async function matchPreview(description, files) {
  const formData = new FormData();
  formData.append("description", description);
  for (const file of files) formData.append("resumes", file);
  return fetch(`${API_BASE}/public/match`, {
    method: "POST",
    body: formData,
  }).then(handle);
}

export async function submitDeletionRequest(payload) {
  return fetch(`${API_BASE}/public/deletion-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handle);
}

export async function getJobs() {
  return fetch(`${API_BASE}/jobs`, { headers: await authHeaders() }).then(handle);
}

export async function getAnalytics() {
  return fetch(`${API_BASE}/analytics`, { headers: await authHeaders() }).then(handle);
}

export async function downloadCalibrationExport() {
  const res = await fetch(`${API_BASE}/analytics/calibration-export`, { headers: await authHeaders() });
  if (!res.ok) return handle(res);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `resumematch-calibration-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function createJob(title, description, domain, interviewUrl, requirementConfig, emailTemplates) {
  return fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ title, description, domain: domain || undefined, interview_url: interviewUrl || undefined, requirement_config: requirementConfig, email_templates: emailTemplates }),
  }).then(handle);
}

export async function updateJobSettings(jobId, settings) {
  return fetch(`${API_BASE}/jobs/${jobId}/settings`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify(settings) }).then(handle);
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

export async function importCandidateCsv(jobId, file, resumes = []) {
  const formData = new FormData();
  formData.append("csv", file);
  for (const resume of resumes) formData.append("resumes", resume);
  return fetch(`${API_BASE}/jobs/${jobId}/candidates/import`, {
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

export async function getStarredCandidates() {
  return fetch(`${API_BASE}/candidates/starred`, { headers: await authHeaders() }).then(handle);
}

export async function setCandidateStarred(candidateId, starred) {
  return fetch(`${API_BASE}/candidates/${candidateId}/star`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ starred }),
  }).then(handle);
}

export async function updateCandidateWorkflow(candidateId, changes) {
  return fetch(`${API_BASE}/candidates/${candidateId}/workflow`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(changes),
  }).then(handle);
}

export async function bulkUpdateCandidateWorkflow(candidateIds, pipeline_stage) {
  return fetch(`${API_BASE}/candidates/bulk-workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ candidate_ids: candidateIds, pipeline_stage }),
  }).then(handle);
}

export async function updateCandidateFeedback(candidateId, feedback, note = "") {
  return fetch(`${API_BASE}/candidates/${candidateId}/feedback`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify({ match_feedback: feedback, match_feedback_note: note }) }).then(handle);
}

export async function markCandidateReviewed(candidateId) {
  return fetch(`${API_BASE}/candidates/${candidateId}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
  }).then(handle);
}

export async function downloadInterviewCalendar(candidateId, start, end, location = "") {
  const params = new URLSearchParams({ start, end });
  if (location) params.set("location", location);
  const res = await fetch(`${API_BASE}/candidates/${candidateId}/interview.ics?${params}`, { headers: await authHeaders() });
  if (!res.ok) return handle(res);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `interview-${candidateId}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function getInterviewCalendarLinks(candidateId, start, end, location = "") {
  const query = new URLSearchParams({ start, end });
  if (location) query.set("location", location);
  return fetch(`${API_BASE}/candidates/${candidateId}/interview-links?${query}`, { headers: await authHeaders() }).then(handle);
}

export async function updateCandidateContact(candidateId, fields) {
  return fetch(`${API_BASE}/candidates/${candidateId}/contact`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(fields),
  }).then(handle);
}

export async function getCandidateActivity(candidateId) {
  return fetch(`${API_BASE}/candidates/${candidateId}/activity`, { headers: await authHeaders() }).then(handle);
}

export async function sendCandidateEmail(candidateId, type) {
  return fetch(`${API_BASE}/candidates/${candidateId}/email`, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify({ type }) }).then(handle);
}

export async function shortlistCandidate(candidateId) {
  return fetch(`${API_BASE}/candidates/${candidateId}/shortlist`, {
    method: "POST",
    headers: await authHeaders(),
  }).then(handle);
}

export async function deleteCandidate(candidateId) {
  return fetch(`${API_BASE}/candidates/${candidateId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  }).then((res) => {
    if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
  });
}

export async function reprocessCandidate(candidateId) {
  return fetch(`${API_BASE}/candidates/${candidateId}/reprocess`, { method: "POST", headers: await authHeaders() }).then(handle);
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

export async function downloadActivityExport(jobId, jobTitle) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/activity-export`, { headers: await authHeaders() });
  if (!res.ok) throw new Error(`Activity export failed with status ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(jobTitle || jobId).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-activity.csv`;
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
