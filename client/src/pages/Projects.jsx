import { useEffect, useState } from "react";
import { getJobs, deleteJob } from "../api";

export default function Projects({ onOpenJob, onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(e, job) {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Delete "${job.title}"? This will permanently remove the project and all ${job.candidate_count} candidate(s) in it.`
    );
    if (!confirmed) return;
    await deleteJob(job.id);
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
  }

  if (loading) return <p className="p-10 text-[var(--color-text-muted)]">Loading projects...</p>;
  if (error) return <p className="p-10 text-[var(--color-danger)]">{error}</p>;

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
        <p className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
          No projects yet. Create one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
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
