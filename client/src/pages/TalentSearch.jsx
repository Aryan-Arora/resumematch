import { useEffect, useState } from "react";
import { getJobs, searchTalent, explainTalent } from "../api";
import ScoreRing from "../components/ScoreRing";

// One anonymized candidate from the opted-in pool. Fetches its skill overlap
// ("has / lacks") lazily on expand — still anonymized (no name/contact).
function TalentCard({ result, query }) {
  const [expanded, setExpanded] = useState(false);
  const [explain, setExplain] = useState(null); // { loading, data, error }

  async function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && !explain) {
      setExplain({ loading: true });
      try {
        const data = await explainTalent(result.id, query);
        setExplain({ loading: false, data });
      } catch (err) {
        setExplain({ loading: false, error: err.message });
      }
    }
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={result.similarity} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-[var(--color-text)]">
            {result.label}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Opted-in candidate · identity hidden until they accept contact
          </p>
        </div>
        <button
          onClick={toggle}
          className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-0.5 flex-shrink-0"
        >
          {expanded ? "Hide" : "Why?"}
          <span className="material-symbols-outlined text-[16px]">
            {expanded ? "expand_less" : "expand_more"}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]/60">
          {explain?.loading && (
            <p className="text-xs text-[var(--color-text-muted)]">Analyzing fit…</p>
          )}
          {explain?.error && <p className="text-xs text-[var(--color-danger)]">{explain.error}</p>}
          {explain?.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-heading font-semibold uppercase tracking-wide text-[var(--color-accent)] mb-1.5">
                  Has ({explain.data.has.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {explain.data.has.length === 0 ? (
                    <span className="text-[11px] text-[var(--color-text-faint)]">
                      No direct overlap
                    </span>
                  ) : (
                    explain.data.has.map((s) => (
                      <span
                        key={s}
                        className="bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[11px] px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-heading font-semibold uppercase tracking-wide text-[var(--color-danger)] mb-1.5">
                  Lacks ({explain.data.lacks.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {explain.data.lacks.length === 0 ? (
                    <span className="text-[11px] text-[var(--color-text-faint)]">Nothing major</span>
                  ) : (
                    explain.data.lacks.map((s) => (
                      <span
                        key={s}
                        className="bg-[var(--color-danger-soft)]/40 text-[var(--color-danger)] text-[11px] px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Recruiter view: search the opted-in seeker pool by an existing job or a pasted
// role. Results are anonymized (fit + skills only) — the consent-first, DPDP
// model from the architecture doc. Double-blind contact unlock is a follow-on.
export default function TalentSearch() {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [description, setDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch(() => {});
  }, []);

  const query = jobId ? { jobId } : { description };

  async function handleSearch(e) {
    e.preventDefault();
    if (!jobId && !description.trim()) {
      setError("Pick a job or paste a role to search for.");
      return;
    }
    setError(null);
    setLoading(true);
    setResults(null);
    try {
      const data = await searchTalent({ ...query, limit: 25 });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-1">Talent Search</h1>
      <p className="text-[var(--color-text-muted)] text-sm mb-6">
        Search job seekers who have opted in to be discovered. Results are anonymized — you see fit
        and skills, not names or contact details.
      </p>

      <form onSubmit={handleSearch} className="clay-card p-5 space-y-3 mb-6">
        <div>
          <label className="block font-heading text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
            Search by an existing job
          </label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="">— none (paste a role below) —</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
        {!jobId && (
          <div>
            <label className="block font-heading text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
              …or paste a role
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste a job description or the skills you're hiring for..."
              className="inner-recess w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] h-32 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
            />
          </div>
        )}
        {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="clay-button bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Searching…" : "Search talent pool"}
        </button>
      </form>

      {results &&
        (results.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]/60 rounded-lg px-3.5 py-3">
            No opted-in candidates match yet. The pool grows as job seekers opt in to be discovered.
          </p>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-[var(--color-text-faint)] uppercase tracking-wide">
              {results.length} matching candidate(s)
            </h2>
            {results.map((r) => (
              <TalentCard key={r.id} result={r} query={query} />
            ))}
          </div>
        ))}
    </div>
  );
}
