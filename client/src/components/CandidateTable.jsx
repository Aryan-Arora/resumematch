import { Fragment, useEffect, useState, useCallback, useMemo } from "react";
import {
  getCandidates,
  deleteCandidate,
  downloadExport,
  getSkillTaxonomy,
  viewResume,
  viewComplianceNotice,
  setCandidateStarred,
  shortlistCandidate,
  updateCandidateWorkflow,
  bulkUpdateCandidateWorkflow,
  updateCandidateFeedback,
  sendCandidateEmail,
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
  engineering: "Engineering",
  education: "Education",
  legal: "Legal",
  creative_design: "Creative & Design",
  manufacturing_production: "Manufacturing & Production",
  general: "General (auto-extracted)",
};

function ScoreRing({ score }) {
  if (score === null || score === undefined) {
    return <span className="text-[var(--color-text-faint)] text-sm">—</span>;
  }
  const pct = Math.round(Number(score) * 100);
  return (
    <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
      <div className="circular-progress absolute inset-0 rounded-full" style={{ "--percentage": pct }} />
      <div className="absolute inset-1 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
        <span className="font-heading text-xs font-bold text-[var(--color-text)]">{pct}%</span>
      </div>
    </div>
  );
}

function EligibilityBadge({ candidate }) {
  if (candidate.unparseable || candidate.eligibility_status === "needs_review") {
    return <span className="inline-flex items-center gap-1.5 text-[var(--color-warning,#b7791f)] text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-current" />Needs review</span>;
  }
  if (candidate.eligibility_status === "ineligible") {
    return <span className="inline-flex items-center gap-1.5 text-[var(--color-danger)] text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-current" />Gate failed</span>;
  }
  return <span className="inline-flex items-center gap-1.5 text-[var(--color-success)] text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-current" />Eligible</span>;
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
  const [shortlistingId, setShortlistingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [search, setSearch] = useState("");
  const [eligibilityFilter, setEligibilityFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [compareIds, setCompareIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("table");
  const [savingWorkflowId, setSavingWorkflowId] = useState(null);

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

  async function handleShortlist(id, fileName) {
    const confirmed = window.confirm(
      `Send "${fileName}" a shortlist email for the physical round?`
    );
    if (!confirmed) return;
    setActionError(null);
    setShortlistingId(id);
    try {
      const updated = await shortlistCandidate(id);
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, shortlisted: updated.shortlisted, shortlist_email_sent_at: updated.shortlist_email_sent_at }
            : c
        )
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setShortlistingId(null);
    }
  }

  async function updateWorkflow(id, changes) {
    setSavingWorkflowId(id);
    setActionError(null);
    try {
      const updated = await updateCandidateWorkflow(id, changes);
      setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingWorkflowId(null);
    }
  }

  async function bulkStage(stage) {
    if (!selectedIds.size) return;
    try {
      const updated = await bulkUpdateCandidateWorkflow([...selectedIds], stage);
      const changes = new Map(updated.map((item) => [item.id, item.pipeline_stage]));
      setCandidates((prev) => prev.map((c) => changes.has(c.id) ? { ...c, pipeline_stage: changes.get(c.id) } : c));
      setSelectedIds(new Set());
    } catch (err) { setActionError(err.message); }
  }

  function toggleCompare(id) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }

  async function saveFeedback(id, value) {
    try {
      const updated = await updateCandidateFeedback(id, value);
      setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, ...updated } : c));
    } catch (err) { setActionError(err.message); }
  }

  async function emailCandidate(id, type) {
    setActionError(null);
    try { await sendCandidateEmail(id, type); } catch (err) { setActionError(err.message); }
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
        if (eligibilityFilter !== "all" && (c.eligibility_status || "needs_review") !== eligibilityFilter) return false;
        if (search && !`${c.file_name} ${c.email || ""} ${(c.matched_skills || []).join(" ")} ${(c.tags || []).join(" ")} ${c.recruiter_notes || ""}`.toLowerCase().includes(search.toLowerCase())) return false;
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
  }, [weightedCandidates, minScore, mustHaveSkill, eligibilityFilter, search]);

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
            className="glass-panel whitespace-nowrap text-[var(--color-text)] font-heading font-medium text-sm px-3.5 py-2 hover:bg-[var(--color-surface-alt)] transition"
          >
            Add More Resumes
          </button>
          <button
            onClick={() => viewComplianceNotice(job.id, semanticWeight)}
            title="Auto-generated AEDT candidate disclosure notice for this role — have counsel review before use"
            className="glass-panel whitespace-nowrap text-[var(--color-text)] font-heading font-medium text-sm px-3.5 py-2 hover:bg-[var(--color-surface-alt)] transition"
          >
            Compliance Notice
          </button>
          <button
            onClick={() => downloadExport(job.id, job.title)}
            className="clay-button whitespace-nowrap bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-3.5 py-2 rounded-xl transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {actionError && (
        <p className="mb-4 text-[var(--color-danger)] text-sm bg-[var(--color-danger-soft)]/40 border border-[var(--color-danger)]/20 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex justify-end mb-3"><div className="glass-panel p-1"><button onClick={() => setViewMode("table")} className={`px-3 py-1.5 text-xs rounded ${viewMode === "table" ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}>Table</button><button onClick={() => setViewMode("board")} className={`px-3 py-1.5 text-xs rounded ${viewMode === "board" ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}>Board</button></div></div>
          <div className="clay-card p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates, skills, notes..." className="flex-1 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)]" />
            <select value={eligibilityFilter} onChange={(e) => setEligibilityFilter(e.target.value)} className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)]"><option value="all">All review states</option><option value="eligible">Eligible</option><option value="needs_review">Needs review</option><option value="ineligible">Gate failed</option></select>
          </div>
          {selectedIds.size > 0 && <div className="mb-4 flex flex-wrap items-center gap-2 text-sm"><span className="text-[var(--color-text-muted)]">{selectedIds.size} selected</span>{[["screening","Move to screening"],["shortlisted","Shortlist"],["rejected","Reject"]].map(([stage, label]) => <button key={stage} onClick={() => bulkStage(stage)} className="glass-panel px-3 py-1.5 text-[var(--color-text)]">{label}</button>)}</div>}
          {compareIds.size > 0 && <div className="clay-card mb-4 p-4 overflow-x-auto"><div className="flex items-center justify-between mb-3"><h3 className="font-heading text-sm font-semibold text-[var(--color-text)]">Candidate comparison ({compareIds.size}/4)</h3><button onClick={() => setCompareIds(new Set())} className="text-xs text-[var(--color-accent)] hover:underline">Clear</button></div><table className="w-full min-w-[620px] text-sm"><tbody><tr className="border-b border-[var(--color-border)]/50"><th className="text-left py-2 pr-4 text-xs uppercase text-[var(--color-text-muted)]">Candidate</th>{[...compareIds].map((id) => <td key={id} className="py-2 px-3 font-medium text-[var(--color-text)]">{candidates.find((c) => c.id === id)?.file_name}</td>)}</tr><tr className="border-b border-[var(--color-border)]/50"><th className="text-left py-2 pr-4 text-xs uppercase text-[var(--color-text-muted)]">Score</th>{[...compareIds].map((id) => { const c = weightedCandidates.find((item) => item.id === id); return <td key={id} className="py-2 px-3 text-[var(--color-text)]">{c?.weighted_score == null ? "—" : `${Math.round(c.weighted_score * 100)}%`}</td>; })}</tr><tr className="border-b border-[var(--color-border)]/50"><th className="text-left py-2 pr-4 text-xs uppercase text-[var(--color-text-muted)]">Eligibility</th>{[...compareIds].map((id) => <td key={id} className="py-2 px-3 text-[var(--color-text)]">{candidates.find((c) => c.id === id)?.eligibility_status || "Needs review"}</td>)}</tr><tr><th className="text-left py-2 pr-4 text-xs uppercase text-[var(--color-text-muted)]">Matched / missing</th>{[...compareIds].map((id) => { const c = candidates.find((item) => item.id === id); return <td key={id} className="py-2 px-3 text-[var(--color-text-muted)]">{c?.matched_skills?.length || 0} / {c?.missing_skills?.length || 0}</td>; })}</tr></tbody></table></div>}
          {viewMode === "board" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-x-auto">
              {[['new','New'],['screening','Screening'],['shortlisted','Shortlisted'],['interview','Interview'],['offer','Offer'],['rejected','Rejected']].map(([stage, label]) => <section key={stage} className="clay-card p-3 min-h-48"><div className="flex items-center justify-between mb-3"><h3 className="font-heading text-sm font-semibold text-[var(--color-text)]">{label}</h3><span className="text-xs text-[var(--color-text-faint)]">{filteredCandidates.filter((c) => (c.pipeline_stage || "new") === stage).length}</span></div><div className="space-y-2">{filteredCandidates.filter((c) => (c.pipeline_stage || "new") === stage).map((c) => <article key={c.id} className="rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-surface)] p-3"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-[var(--color-text)] truncate">{c.file_name}</p><span className="text-xs text-[var(--color-text-muted)]">{c.weighted_score == null ? "—" : `${Math.round(c.weighted_score * 100)}%`}</span></div><p className="text-xs text-[var(--color-text-faint)] mt-1">{c.eligibility_status || "needs review"}</p><select value={c.pipeline_stage || "new"} onChange={(e) => updateWorkflow(c.id, { pipeline_stage: e.target.value })} className="mt-2 w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded px-2 py-1 text-xs text-[var(--color-text)]">{[['new','New'],['screening','Screening'],['shortlisted','Shortlisted'],['interview','Interview'],['offer','Offer'],['rejected','Rejected']].map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></article>)}</div></section>)}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <p className="clay-card text-[var(--color-text-muted)] px-5 py-8 text-center text-sm">
              No candidates match the current filters.
            </p>
          ) : (
            <div className="clay-card overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm table-fixed">
                <thead>
                  <tr className="border-b border-[var(--color-border)]/60 bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[48%] sm:w-[26%]"><span className="flex items-center gap-2"><input type="checkbox" checked={filteredCandidates.length > 0 && filteredCandidates.every((c) => selectedIds.has(c.id))} onChange={(e) => setSelectedIds(e.target.checked ? new Set(filteredCandidates.map((c) => c.id)) : new Set())} />Candidate</span>
                    </th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide text-center w-[14%] sm:w-[13%]">
                      Score
                    </th>
                    <th className="hidden sm:table-cell py-3 px-3 font-medium text-xs uppercase tracking-wide sm:w-[12%]">
                      Semantic
                    </th>
                    <th className="hidden sm:table-cell py-3 px-3 font-medium text-xs uppercase tracking-wide sm:w-[11%]">Skill</th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[15%] sm:w-[17%]">Status</th>
                    <th className="py-3 px-5 w-[23%] sm:w-[21%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c) => (
                    <Fragment key={c.id}>
                      <tr
                        className="border-b border-[var(--color-border)]/40 last:border-b-0 cursor-pointer hover:bg-[var(--color-surface-hover)] transition"
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      >
                        <td className="py-3 px-2 sm:px-5 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <Avatar name={c.file_name} size={36} className="hidden sm:flex" />
                            <input type="checkbox" checked={selectedIds.has(c.id)} onChange={(e) => { e.stopPropagation(); setSelectedIds((prev) => { const next = new Set(prev); e.target.checked ? next.add(c.id) : next.delete(c.id); return next; }); }} onClick={(e) => e.stopPropagation()} /><button type="button" onClick={(e) => { e.stopPropagation(); toggleCompare(c.id); }} title="Compare candidate" className={`text-[10px] rounded border px-1.5 py-0.5 ${compareIds.has(c.id) ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-text-faint)]"}`}>Compare</button><span className="text-[var(--color-text)] font-medium truncate block min-w-0">
                              {c.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-5">
                          <div className="flex justify-center">
                            <ScoreRing score={c.weighted_score} />
                          </div>
                        </td>
                        <td className="hidden sm:table-cell py-3 px-3 text-[var(--color-text-muted)]">
                          {formatScore(c.semantic_score)}
                        </td>
                        <td className="hidden sm:table-cell py-3 px-3 text-[var(--color-text-muted)]">
                          {formatScore(c.skill_score)}
                        </td>
                        <td className="py-3 px-2 sm:px-5">
                          {c.status === "queued" ? (
                            <span className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-faint)] animate-pulse flex-shrink-0" />
                              <span className="truncate">Processing</span>
                            </span>
                          ) : c.status === "failed" ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-[var(--color-danger)] text-xs font-medium"
                              title={c.error_message || ""}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] flex-shrink-0" />
                              <span className="truncate">Failed</span>
                            </span>
                          ) : c.eligibility_status ? (
                            <EligibilityBadge candidate={c} />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[var(--color-success)] text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] flex-shrink-0" />
                              <span className="truncate">Scored</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-5">
                          <div className="flex items-center gap-2 sm:gap-3">
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
                            {!c.unparseable && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!c.shortlist_email_sent_at && c.email && shortlistingId !== c.id) {
                                    handleShortlist(c.id, c.file_name);
                                  }
                                }}
                                disabled={shortlistingId === c.id}
                                title={
                                  c.shortlist_email_sent_at
                                    ? `Shortlist email sent ${new Date(c.shortlist_email_sent_at).toLocaleString()}`
                                    : c.email
                                      ? "Send shortlist email for the physical round"
                                      : "No email address found on this resume"
                                }
                                className={`text-xs transition disabled:opacity-50 ${
                                  c.shortlist_email_sent_at
                                    ? "text-[var(--color-success)]"
                                    : c.email
                                      ? "text-[var(--color-text-faint)] hover:text-[var(--color-accent)]"
                                      : "text-[var(--color-text-faint)]/40 cursor-not-allowed"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {c.shortlist_email_sent_at ? "mark_email_read" : "forward_to_inbox"}
                                </span>
                              </button>
                            )}
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
                                <div className="sm:col-span-2 rounded-xl border border-[var(--color-border)]/60 bg-[var(--color-surface)]/60 p-4">
                                  <div className="flex items-center justify-between gap-3 mb-2">
                                    <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Eligibility gates</h3>
                                    {c.parse_confidence !== null && c.parse_confidence !== undefined && <span className="text-xs text-[var(--color-text-faint)]">Parse confidence {Math.round(Number(c.parse_confidence) * 100)}%</span>}
                                  </div>
                                  <div className="space-y-1.5">
                                    {(c.eligibility_reasons || []).map((reason, index) => <p key={`${reason.text}-${index}`} className={`text-sm ${reason.type === "failed" ? "text-[var(--color-danger)]" : reason.type === "passed" ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"}`}>{reason.type === "passed" ? "✓" : reason.type === "failed" ? "×" : "?"} {reason.text}</p>)}
                                    {(c.parse_warnings || []).map((warning) => <p key={warning} className="text-sm text-[var(--color-text-muted)]">⚠ {warning}</p>)}
                                  </div>
                                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <label className="text-xs text-[var(--color-text-muted)]">Pipeline stage
                                      <select value={c.pipeline_stage || "new"} disabled={savingWorkflowId === c.id} onChange={(e) => updateWorkflow(c.id, { pipeline_stage: e.target.value })} className="mt-1 w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-2.5 py-2 text-sm text-[var(--color-text)]">
                                        {[["new","New"],["screening","Screening"],["shortlisted","Shortlisted"],["interview","Interview"],["offer","Offer"],["rejected","Rejected"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                      </select>
                                    </label>
                                    <label className="text-xs text-[var(--color-text-muted)]">Recruiter note
                                      <textarea defaultValue={c.recruiter_notes || ""} onBlur={(e) => e.target.value !== (c.recruiter_notes || "") && updateWorkflow(c.id, { recruiter_notes: e.target.value })} placeholder="Add a review note..." className="mt-1 w-full min-h-10 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-2.5 py-2 text-sm text-[var(--color-text)]" />
                                    </label>
                                  </div>
                                  <label className="block mt-3 text-xs text-[var(--color-text-muted)]">Follow-up reminder
                                    <input type="datetime-local" value={c.reminder_at ? new Date(c.reminder_at).toISOString().slice(0, 16) : ""} onChange={(e) => updateWorkflow(c.id, { reminder_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="mt-1 w-full sm:w-64 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-2.5 py-2 text-sm text-[var(--color-text)]" />
                                  </label>
                                  {c.reminder_at && <p className="text-xs text-[var(--color-text-faint)] mt-1">Reminder set for {new Date(c.reminder_at).toLocaleString()}</p>}
                                  {c.pipeline_stage === "interview" && job.interview_url && <a href={job.interview_url} target="_blank" rel="noreferrer" className="inline-flex mt-3 text-sm text-[var(--color-accent)] hover:underline">Open interview scheduling link →</a>}
                                  <label className="inline-flex items-center gap-2 mt-3 text-xs text-[var(--color-text-muted)]">Was this match accurate?
                                    <select value={c.match_feedback || ""} onChange={(e) => e.target.value && saveFeedback(c.id, e.target.value)} className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded px-2 py-1 text-xs text-[var(--color-text)]"><option value="">Unreviewed</option><option value="accurate">Accurate</option><option value="inaccurate">Inaccurate</option><option value="unclear">Unclear</option></select>
                                  </label>
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {c.email && <><button onClick={() => emailCandidate(c.id, "shortlist")} className="text-xs text-[var(--color-accent)] hover:underline">Send shortlist email</button><button onClick={() => emailCandidate(c.id, "interview")} className="text-xs text-[var(--color-accent)] hover:underline">Send interview invite</button><button onClick={() => emailCandidate(c.id, "rejection")} className="text-xs text-[var(--color-danger)] hover:underline">Send rejection email</button></>}
                                  </div>
                                </div>
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
          <div className="bg-[var(--color-panel-dark)] text-white rounded-2xl p-5 shadow-[0_24px_48px_-28px_rgba(0,102,138,0.5)]">
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

          <div className="clay-card p-5">
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
