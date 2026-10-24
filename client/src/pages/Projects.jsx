import { useEffect, useState } from "react";
import { getJobs, deleteJob } from "../api";

export default function Projects({ onOpenJob, onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    getJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(e, job) {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Delete "${job.title}"? This will permanently remove the project and all ${job.candidate_count} candidate(s) in it.`
    );
    if (!confirmed) return;
    await deleteJob(job.id);
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
  }

  if (loading) return <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10" aria-busy="true"><div className="h-8 w-48 rounded-lg bg-[var(--color-surface-high)] animate-pulse" /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"><div className="h-36 rounded-2xl bg-[var(--color-surface-high)] animate-pulse" /><div className="h-36 rounded-2xl bg-[var(--color-surface-high)] animate-pulse" /></div></div>;
  if (error) return <div className="max-w-xl mx-auto px-4 sm:px-8 py-16"><div className="clay-card p-6 border-[var(--color-danger)]/30" role="alert"><span className="material-symbols-outlined text-[var(--color-danger)]">cloud_off</span><h1 className="font-heading text-lg font-semibold text-[var(--color-text)] mt-3">Couldn’t load projects</h1><p className="text-sm text-[var(--color-text-muted)] mt-1">{error}</p><button onClick={load} className="clay-button mt-5 bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] rounded-xl px-4 py-2.5 text-sm font-medium">Try again</button></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[var(--color-text)]">Projects</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">{jobs.length} project(s)</p>
        </div>
        <button
          onClick={() => onNavigate("upload")}
          className="bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Project
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl px-5 py-10 text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            No projects yet — create one to start screening candidates.
          </p>
          <button
            onClick={() => onNavigate("upload")}
            className="inline-flex items-center gap-2 bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg transition"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Project
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenJob(job)}
              onKeyDown={(e) => e.key === "Enter" && onOpenJob(job)}
              className="relative text-left bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-5 hover:border-[var(--color-accent)]/50 hover:shadow-md transition cursor-pointer"
            >
              <button
                onClick={(e) => handleDelete(e, job)}
                aria-label={`Delete ${job.title}`}
                className="absolute top-4 right-4 text-[var(--color-text-faint)] hover:text-[var(--color-danger)] transition"
                title="Delete project"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
              <h3 className="font-heading text-base font-semibold text-[var(--color-text)] mb-1 pr-8">
                {job.title}
              </h3>
              <p className="text-xs text-[var(--color-text-faint)] mb-3">
                Created {new Date(job.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                    Candidates
                  </p>
                  <p className="font-heading text-lg font-semibold text-[var(--color-text)]">
                    {job.candidate_count}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                    Avg. Match
                  </p>
                  <p className="font-heading text-lg font-semibold text-[var(--color-text)]">
                    {job.avg_score !== null ? `${Math.round(job.avg_score * 100)}%` : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
