import { useEffect, useState } from "react";
import { getJobs } from "../api";

function StatCard({ label, value, sublabel }) {
  return (
    <div className="clay-card p-5 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-[var(--color-accent)]/10 rounded-full blur-2xl" />
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1 relative">
        {label}
      </p>
      <p className="font-heading text-2xl font-semibold text-[var(--color-text)] relative">
        {value}
        {sublabel && (
          <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1">{sublabel}</span>
        )}
      </p>
    </div>
  );
}

export default function Dashboard({ onOpenJob, onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-10 text-[var(--color-text-muted)]">Loading dashboard...</p>;
  if (error) return <p className="p-10 text-[var(--color-danger)]">{error}</p>;

  const totalCandidates = jobs.reduce((sum, j) => sum + j.candidate_count, 0);
  const scored = jobs.filter((j) => j.avg_score !== null);
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, j) => sum + j.avg_score, 0) / scored.length
      : null;
  const recent = jobs.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[var(--color-text)]">
            Recruitment Overview
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Real-time snapshot of your talent pipelines.
          </p>
        </div>
        <button
          onClick={() => onNavigate("upload")}
          className="clay-button bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Project
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Projects" value={jobs.length} />
        <StatCard label="Candidates Processed" value={totalCandidates} />
        <StatCard
          label="Avg. Match Score"
          value={avgScore !== null ? `${Math.round(avgScore * 100)}%` : "—"}
        />
      </div>

      <div className="clay-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]/60 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">Recent Projects</h2>
          <button
            onClick={() => onNavigate("projects")}
            className="text-sm text-[var(--color-accent)] hover:underline font-medium"
          >
            View all
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              No projects yet — create one to start screening candidates.
            </p>
            <button
              onClick={() => onNavigate("upload")}
              className="clay-button inline-flex items-center gap-2 bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-xl transition"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Project
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] text-xs uppercase tracking-wide">
                <th className="py-3 px-5 font-medium">Role & Project</th>
                <th className="py-3 px-5 font-medium">Candidates</th>
                <th className="py-3 px-5 font-medium">Avg. Match</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((job) => (
                <tr
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenJob(job)}
                  onKeyDown={(e) => e.key === "Enter" && onOpenJob(job)}
                  className="border-t border-[var(--color-border)]/40 hover:bg-[var(--color-surface-hover)] cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-accent)]"
                >
                  <td className="py-3 px-5 text-[var(--color-text)] font-medium">{job.title}</td>
                  <td className="py-3 px-5 text-[var(--color-text-muted)]">{job.candidate_count}</td>
                  <td className="py-3 px-5 text-[var(--color-text-muted)]">
                    {job.avg_score !== null ? `${Math.round(job.avg_score * 100)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
