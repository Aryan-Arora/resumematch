import { useEffect, useState } from "react";
import { getStarredCandidates, setCandidateStarred, deleteCandidate, viewResume } from "../api";
import Avatar from "../components/Avatar";

export default function StarredCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStarredCandidates()
      .then(setCandidates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // A candidate whose job was already deleted has nowhere else to live once
  // unstarred — starring was the only thing keeping them around, so unstarring
  // here deletes them outright instead of leaving an orphaned, unreachable row.
  async function handleUnstar(candidate) {
    if (candidate.job_id) {
      await setCandidateStarred(candidate.id, false);
    } else {
      const confirmed = window.confirm(
        `"${candidate.file_name}"'s original job no longer exists. Unstarring will permanently delete this CV. Continue?`
      );
      if (!confirmed) return;
      await deleteCandidate(candidate.id);
    }
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
  }

  if (loading) return <p className="p-10 text-[var(--color-text-muted)]">Loading starred CVs...</p>;
  if (error) return <p className="p-10 text-[var(--color-danger)]">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-[var(--color-text)]">Starred CVs</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {candidates.length} candidate(s) — kept for future roles even if their original job is
          deleted or auto-expires after 180 days.
        </p>
      </div>

      {candidates.length === 0 ? (
        <p className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
          No starred candidates yet. Star a candidate from any project's shortlist to save them here.
        </p>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl overflow-x-auto transition-colors">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]/60 bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
                <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide">Candidate</th>
                <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide">Originally screened for</th>
                <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide">Starred</th>
                <th className="py-3 px-5"></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--color-border)]/40 last:border-b-0 hover:bg-[var(--color-surface-hover)] transition"
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.file_name} size={36} />
                      <span className="text-[var(--color-text)] font-medium">{c.file_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-[var(--color-text-muted)]">{c.job_title}</td>
                  <td className="py-3 px-5 text-[var(--color-text-muted)]">
                    {c.starred_at ? new Date(c.starred_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      {c.file_path && (
                        <button
                          onClick={() => viewResume(c.id)}
                          className="text-[var(--color-accent)] hover:underline text-xs font-medium transition"
                        >
                          View
                        </button>
                      )}
                      <button
                        onClick={() => handleUnstar(c)}
                        className="text-[var(--color-text-faint)] hover:text-[var(--color-danger)] text-xs font-medium transition"
                      >
                        {c.job_id ? "Unstar" : "Unstar (deletes)"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
