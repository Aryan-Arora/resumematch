import { Fragment, useEffect, useState, useCallback, useMemo } from "react";
import {
  getCandidates,
  deleteCandidate,
  downloadExport,
  getSkillTaxonomy,
  viewResume,
  viewComplianceNotice,
  setCandidateStarred,
} from "../api";
import SkillRadar from "./SkillRadar";
import Avatar from "./Avatar";

function formatScore(score) {
  return score === null || score === undefined ? "—" : Number(score).toFixed(2);
}

const DOMAIN_LABELS = {
  tech: "Tech",
  service_delivery: "Service Delivery",
  sales: "Sales",
  marketing: "Marketing",
  finance_accounting: "Finance & Accounting",
  hr_recruiting: "HR & Recruiting",
  skilled_trades: "Skilled Trades",
  healthcare_support: "Healthcare Support",
  hospitality_food_service: "Hospitality & Food Service",
  logistics_warehouse: "Logistics & Warehouse",
  general: "General (auto-extracted)",
};

function ScoreRing({ score }) {
  if (score === null || score === undefined) {
    return <span className="text-[var(--color-text-faint)] text-sm">—</span>;
  }
  const pct = Math.round(Number(score) * 100);
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="circular-progress absolute inset-0 rounded-full" style={{ "--percentage": pct }} />
      <div className="absolute inset-1 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
        <span className="font-heading text-xs font-bold text-[var(--color-text)]">{pct}%</span>
      </div>
    </div>
  );
}

export default function CandidateTable({ job, onAddMore }) {
  const [candidates, setCandidates] = useState([]);
  const [taxonomy, setTaxonomy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [minScore, setMinScore] = useState(0);
  const [mustHaveSkill, setMustHaveSkill] = useState("");
  const [semanticWeight, setSemanticWeight] = useState(60);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [candidateData, taxonomyData] = await Promise.all([
        getCandidates(job.id),
        getSkillTaxonomy(job.jd_domain),
      ]);
      setCandidates(candidateData);
      setTaxonomy(taxonomyData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [job.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id, fileName) {
    const confirmed = window.confirm(`Remove "${fileName}" from this shortlist?`);
    if (!confirmed) return;
    await deleteCandidate(id);
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleToggleStar(id, starred) {
    const updated = await setCandidateStarred(id, !starred);
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, starred: updated.starred } : c)));
  }

  const skillWeight = 100 - semanticWeight;

  const weightedCandidates = useMemo(() => {
    return candidates.map((c) => {
      if (c.unparseable || c.semantic_score === null || c.skill_score === null) {
        return { ...c, weighted_score: null };
      }
      const weighted =
        (Number(c.semantic_score) * semanticWeight + Number(c.skill_score) * skillWeight) / 100;
      return { ...c, weighted_score: weighted };
    });
  }, [candidates, semanticWeight, skillWeight]);

  const filteredCandidates = useMemo(() => {
    return weightedCandidates
      .filter((c) => {
        if (c.unparseable) return minScore === 0;
        if ((c.weighted_score ?? 0) < minScore) return false;
        if (
          mustHaveSkill &&
          !(c.matched_skills || []).includes(mustHaveSkill) &&
          !(c.implied_skills || []).includes(mustHaveSkill)
        )
          return false;
        return true;
      })
      .sort((a, b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1));
  }, [weightedCandidates, minScore, mustHaveSkill]);

  if (loading)
    return (
      <p className="max-w-6xl mx-auto px-8 py-10 text-[var(--color-text-muted)]">
        Loading candidates...
      </p>
    );
  if (error)
    return <p className="max-w-6xl mx-auto px-8 py-10 text-[var(--color-danger)]">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold text-[var(--color-text)]">{job.title}</h1>
            <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wide text-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-full px-2 py-1">
              {DOMAIN_LABELS[job.jd_domain] || "Tech"}
            </span>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            {filteredCandidates.length} of {candidates.length} candidate(s)
          </p>
        </div>
        <div className="flex flex-wrap gap-3 flex-shrink-0">
          <button
            onClick={onAddMore}
            className="whitespace-nowrap border border-[var(--color-border)] text-[var(--color-text)] font-heading font-medium text-sm px-3.5 py-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition"
          >
            Add More Resumes
          </button>
          <button
            onClick={() => viewComplianceNotice(job.id, semanticWeight)}
            title="Auto-generated AEDT candidate disclosure notice for this role — have counsel review before use"
            className="whitespace-nowrap border border-[var(--color-border)] text-[var(--color-text)] font-heading font-medium text-sm px-3.5 py-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition"
          >
            Compliance Notice
          </button>
          <button
            onClick={() => downloadExport(job.id, job.title)}
            className="whitespace-nowrap bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-3.5 py-2 rounded-lg transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          {filteredCandidates.length === 0 ? (
            <p className="text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl px-5 py-8 text-center text-sm">
              No candidates match the current filters.
            </p>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl overflow-x-auto transition-colors">
              <table className="w-full border-collapse text-left text-sm table-fixed">
                <thead>
                  <tr className="border-b border-[var(--color-border)]/60 bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[30%]">
                      Candidate
                    </th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide text-center w-[12%]">
                      Score
                    </th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[11%]">
                      Semantic
                    </th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[10%]">Skill</th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[19%]">Status</th>
                    <th className="py-3 px-5 w-[18%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c) => (
                    <Fragment key={c.id}>
                      <tr
                        className="border-b border-[var(--color-border)]/40 last:border-b-0 cursor-pointer hover:bg-[var(--color-surface-hover)] transition"
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      >
                        <td className="py-3 px-5 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={c.file_name} size={36} />
                            <span className="text-[var(--color-text)] font-medium truncate">
                              {c.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex justify-center">
                            <ScoreRing score={c.weighted_score} />
                          </div>
                        </td>
                        <td className="py-3 px-5 text-[var(--color-text-muted)]">
                          {formatScore(c.semantic_score)}
                        </td>
                        <td className="py-3 px-5 text-[var(--color-text-muted)]">
                          {formatScore(c.skill_score)}
                        </td>
                        <td className="py-3 px-5">
                          {c.status === "queued" ? (
                            <span className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-faint)] animate-pulse" />
                              Processing
                            </span>
                          ) : c.status === "failed" ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-[var(--color-danger)] text-xs font-medium"
                              title={c.error_message || ""}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
                              Failed
                            </span>
                          ) : c.unparseable ? (
                            <span className="inline-flex items-center gap-1.5 text-[var(--color-danger)] text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
                              Unparseable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[var(--color-success)] text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                              Scored
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(c.id, c.starred);
                              }}
                              title={c.starred ? "Unstar (removes retention protection)" : "Star (saves this CV even if the job is deleted or auto-expires)"}
                              className={`text-xs transition ${
                                c.starred
                                  ? "text-[var(--color-accent)]"
                                  : "text-[var(--color-text-faint)] hover:text-[var(--color-accent)]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]" style={c.starred ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                star
                              </span>
                            </button>
                            {!c.unparseable && c.file_path && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewResume(c.id);
                                }}
                                title="View resume"
                                className="text-[var(--color-accent)] transition"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(c.id, c.file_name);
                              }}
                              title="Remove candidate"
                              className="text-[var(--color-text-faint)] hover:text-[var(--color-danger)] transition"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === c.id && (
                        <tr className="border-b border-[var(--color-border)]/40 bg-[var(--color-surface-alt)]/40">
                          <td colSpan={6} className="py-5 px-5">
                            {c.unparseable ? (
                              <p className="text-[var(--color-danger)] text-sm">
                                This resume could not be parsed (scanned image or corrupted file).
                                It was not scored.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                  <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-accent)] mb-2.5">
                                    Matched Skills ({c.matched_skills?.length || 0})
                                  </h3>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(c.matched_skills || []).map((s) => (
                                      <span
                                        key={s}
                                        className="bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 text-xs font-medium px-2.5 py-1 rounded-full"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-implied)] mb-2.5">
                                    Implied Skills ({c.implied_skills?.length || 0})
                                  </h3>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(c.implied_skills || []).length === 0 && (
                                      <span className="text-xs text-[var(--color-text-faint)]">
                                        None detected
                                      </span>
                                    )}
                                    {(c.implied_skills || []).map((s) => (
                                      <span
                                        key={s}
                                        title={
                                          c.implied_skill_evidence?.[s]
                                            ? `Inferred from: "${c.implied_skill_evidence[s]}"`
                                            : "Inferred from resume content"
                                        }
                                        className="bg-[var(--color-implied)]/10 text-[var(--color-implied)] border border-dashed border-[var(--color-implied)]/40 text-xs font-medium px-2.5 py-1 rounded-full cursor-help"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-danger)] mb-2.5">
                                    Missing Skills ({c.missing_skills?.length || 0})
                                  </h3>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(c.missing_skills || []).map((s) => (
                                      <span
                                        key={s}
                                        className="bg-[var(--color-danger-soft)]/40 text-[var(--color-danger)] text-xs font-medium px-2.5 py-1 rounded-full"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2.5">
                                    Skill Coverage
                                  </h3>
                                  <SkillRadar
                                    taxonomy={taxonomy}
                                    jdSkills={job.jd_skills || []}
                                    matchedSkills={[
                                      ...(c.matched_skills || []),
                                      ...(c.implied_skills || []),
                                    ]}
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-[300px] flex-shrink-0 space-y-4">
          <div className="bg-[var(--color-panel-dark)] text-white rounded-xl p-5">
            <h3 className="font-heading text-sm font-semibold mb-1">AI Weighting</h3>
            <p className="text-xs text-white/70 mb-4">
              Adjust how semantic similarity vs. skill match combine into the score.
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5 text-xs">
                  <span>Semantic Match</span>
                  <span className="font-heading font-semibold">{semanticWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={semanticWeight}
                  onChange={(e) => setSemanticWeight(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)] h-1.5"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5 text-xs">
                  <span>Skill Match</span>
                  <span className="font-heading font-semibold">{skillWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={skillWeight}
                  onChange={(e) => setSemanticWeight(100 - Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)] h-1.5"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-5 transition-colors">
            <h4 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Filters</h4>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5">
                Min Score:{" "}
                <span className="text-[var(--color-text)] font-heading font-semibold normal-case">
                  {minScore.toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5">
                Must-Have Skill
              </label>
              <select
                value={mustHaveSkill}
                onChange={(e) => setMustHaveSkill(e.target.value)}
                className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-2.5 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Any</option>
                {(job.jd_skills || []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {(minScore > 0 || mustHaveSkill) && (
              <button
                onClick={() => {
                  setMinScore(0);
                  setMustHaveSkill("");
                }}
                className="mt-4 text-sm text-[var(--color-accent)] hover:underline font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
