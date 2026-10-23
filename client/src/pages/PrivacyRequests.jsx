import { useEffect, useState } from "react";
import { getDeletionRequests, updateDeletionRequest } from "../api";

export default function PrivacyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try { setRequests(await getDeletionRequests()); setError(null); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function resolve(request, status) {
    try {
      const updated = await updateDeletionRequest(request.id, status);
      setRequests((prev) => prev.map((item) => item.id === request.id ? updated : item));
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[var(--color-text)]">Privacy requests</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Review candidate deletion requests. Resolving a request permanently removes the matching candidate and stored resume.</p>
        </div>
        <button onClick={load} className="glass-panel px-3 py-2 text-sm text-[var(--color-text)]">Refresh</button>
      </div>
      {error && <p className="mb-4 text-sm text-[var(--color-danger)]">{error}</p>}
      {loading ? <p className="text-sm text-[var(--color-text-muted)]">Loading requests…</p> : requests.length === 0 ? (
        <div className="clay-card p-8 text-center text-sm text-[var(--color-text-muted)]">No privacy requests yet.</div>
      ) : (
        <div className="clay-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-[var(--color-border)]/60 text-xs uppercase tracking-wide text-[var(--color-text-muted)]"><th className="p-4">Email</th><th className="p-4">Received</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
            <tbody>{requests.map((request) => <tr key={request.id} className="border-b border-[var(--color-border)]/40 last:border-0"><td className="p-4 text-[var(--color-text)]">{request.email}</td><td className="p-4 text-[var(--color-text-muted)]">{new Date(request.created_at).toLocaleString()}</td><td className="p-4 text-[var(--color-text-muted)] capitalize">{request.status}</td><td className="p-4">{request.status === "pending" ? <div className="flex gap-2"><button onClick={() => resolve(request, "resolved")} className="text-xs text-[var(--color-danger)] hover:underline">Approve deletion</button><button onClick={() => resolve(request, "rejected")} className="text-xs text-[var(--color-text-muted)] hover:underline">Reject</button></div> : <span className="text-xs text-[var(--color-text-faint)]">Completed</span>}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
