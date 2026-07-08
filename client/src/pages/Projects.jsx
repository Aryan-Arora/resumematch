import { useEffect, useState } from "react";
import { getJobs } from "../api";

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

  if (loading) return <p className="p-10 text-[#45464d]">Loading projects...</p>;
  if (error) return <p className="p-10 text-[#ba1a1a]">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#0b1c30]">Projects</h1>
          <p className="text-[#45464d] text-sm mt-0.5">{jobs.length} project(s)</p>
        </div>
        <button
          onClick={() => onNavigate("upload")}
          className="bg-black hover:bg-[#1a1a1a] text-white font-heading font-medium text-sm px-4 py-2.5 rounded-lg transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Project
        </button>
      </div>

      {jobs.length === 0 ? (
        <p className="bg-white border border-[#c6c6cd]/60 rounded-xl px-5 py-10 text-center text-sm text-[#45464d]">
          No projects yet. Create one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => onOpenJob(job)}
              className="text-left bg-white border border-[#c6c6cd]/60 rounded-xl shadow-sm p-5 hover:border-[#4648d4]/50 hover:shadow-md transition"
            >
              <h3 className="font-heading text-base font-semibold text-[#0b1c30] mb-1">
                {job.title}
              </h3>
              <p className="text-xs text-[#8a8b93] mb-3">
                Created {new Date(job.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] font-medium text-[#45464d] uppercase tracking-wide">
                    Candidates
                  </p>
                  <p className="font-heading text-lg font-semibold text-[#0b1c30]">
                    {job.candidate_count}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-[#45464d] uppercase tracking-wide">
                    Avg. Match
                  </p>
                  <p className="font-heading text-lg font-semibold text-[#0b1c30]">
                    {job.avg_score !== null ? `${Math.round(job.avg_score * 100)}%` : "—"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
