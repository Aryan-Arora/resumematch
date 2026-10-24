import { useEffect, useState } from "react";
import { searchTalentPool, viewResume } from "../api";
import Avatar from "../components/Avatar";

const stages = ["", "new", "screening", "shortlisted", "interview", "offer", "rejected"];
const eligibility = ["", "eligible", "needs_review", "ineligible"];

export default function TalentPool() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [eligibilityFilter, setEligibilityFilter] = useState("");
  const [results, setResults] = useState({ data: [], pagination: { total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      searchTalentPool({ q: query.trim(), stage, eligibility: eligibilityFilter, limit: 50 })
        .then(setResults)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, query ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [query, stage, eligibilityFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-10">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-accent)] font-semibold mb-2">Reusable candidate library</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--color-text)]">Talent pool</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Find candidates across every project without re-uploading their resumes.</p>
      </div>

      <div className="clay-card p-4 mb-5 flex flex-col md:flex-row gap-3">
        <label className="flex-1 relative">
          <span className="sr-only">Search candidates</span>
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[var(--color-text-faint)]">search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, emails, or recruiter notes…" className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30" />
        </label>
        <select aria-label="Pipeline stage" value={stage} onChange={(event) => setStage(event.target.value)} className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)]">
          {stages.map((value) => <option key={value} value={value}>{value ? value.replace("_", " ") : "All stages"}</option>)}
        </select>
        <select aria-label="Eligibility" value={eligibilityFilter} onChange={(event) => setEligibilityFilter(event.target.value)} className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)]">
          {eligibility.map((value) => <option key={value} value={value}>{value ? value.replace("_", " ") : "All eligibility"}</option>)}
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-[var(--color-danger)]">{error}</p>}
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--color-text-muted)]">
        <span>{loading ? "Searching…" : `${results.pagination?.total || 0} candidate${results.pagination?.total === 1 ? "" : "s"}`}</span>
        <span>Across all projects</span>
      </div>
      {!loading && results.data.length === 0 ? (
        <div className="clay-card px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">No candidates match these filters.</div>
      ) : (
        <div className="clay-card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead><tr className="bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] text-xs uppercase tracking-wide"><th className="py-3 px-5 font-medium">Candidate</th><th className="py-3 px-5 font-medium">Project</th><th className="py-3 px-5 font-medium">Match</th><th className="py-3 px-5 font-medium">Stage</th><th className="py-3 px-5 font-medium">Eligibility</th><th className="py-3 px-5"></th></tr></thead>
            <tbody>{results.data.map((candidate) => <tr key={candidate.id} className="border-t border-[var(--color-border)]/40 hover:bg-[var(--color-surface-hover)]">
              <td className="py-3 px-5"><div className="flex items-center gap-3"><Avatar name={candidate.file_name} size={34} /><div><p className="font-medium text-[var(--color-text)]">{candidate.file_name}</p><p className="text-xs text-[var(--color-text-faint)]">{candidate.email || "No email extracted"}</p></div></div></td>
              <td className="py-3 px-5 text-[var(--color-text-muted)]">{candidate.job?.title || "Deleted project"}</td>
              <td className="py-3 px-5 text-[var(--color-text-muted)]">{candidate.final_score == null ? "—" : `${Math.round(candidate.final_score * 100)}%`}</td>
              <td className="py-3 px-5 capitalize text-[var(--color-text-muted)]">{candidate.pipeline_stage || "new"}</td>
              <td className="py-3 px-5 capitalize text-[var(--color-text-muted)]">{(candidate.eligibility_status || "needs review").replace("_", " ")}</td>
              <td className="py-3 px-5">{candidate.status === "done" && <button onClick={() => viewResume(candidate.id)} className="text-[var(--color-accent)] hover:underline text-xs font-medium">View resume</button>}</td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
