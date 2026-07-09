import { Fragment, useEffect, useState, useCallback, useMemo } from "react";
import { getCandidates, deleteCandidate, downloadExport, getSkillTaxonomy } from "../api";
import SkillRadar from "./SkillRadar";
import Avatar from "./Avatar";

function formatScore(score) {
  return score === null || score === undefined ? "—" : Number(score).toFixed(2);
}

function ScoreRing({ score }) {
  if (score === null || score === undefined) {
    return <span className="text-[#8a8b93] text-sm">—</span>;
  }
  const pct = Math.round(Number(score) * 100);
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="circular-progress absolute inset-0 rounded-full" style={{ "--percentage": pct }} />
      <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
        <span className="font-heading text-xs font-bold text-[#0b1c30]">{pct}%</span>
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
        getSkillTaxonomy(),
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
        if (mustHaveSkill && !(c.matched_skills || []).includes(mustHaveSkill)) return false;
        return true;
      })
      .sort((a, b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1));
  }, [weightedCandidates, minScore, mustHaveSkill]);

  if (loading)
    return <p className="max-w-6xl mx-auto px-8 py-10 text-[#45464d]">Loading candidates...</p>;
  if (error) return <p className="max-w-6xl mx-auto px-8 py-10 text-[#ba1a1a]">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#0b1c30]">{job.title}</h1>
          <p className="text-[#45464d] text-sm mt-0.5">
            {filteredCandidates.length} of {candidates.length} candidate(s)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onAddMore}
            className="border border-[#c6c6cd] text-[#0b1c30] font-heading font-medium text-sm px-3.5 py-2 rounded-lg hover:bg-[#eff4ff] transition"
          >
            Add More Resumes
          </button>
          <button
            onClick={() => downloadExport(job.id, job.title)}
            className="bg-black hover:bg-[#1a1a1a] text-white font-heading font-medium text-sm px-3.5 py-2 rounded-lg transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          {filteredCandidates.length === 0 ? (
            <p className="text-[#45464d] bg-white border border-[#c6c6cd]/60 rounded-xl px-5 py-8 text-center text-sm">
              No candidates match the current filters.
            </p>
          ) : (
            <div className="bg-white border border-[#c6c6cd]/60 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm table-fixed">
                <thead>
                  <tr className="border-b border-[#c6c6cd]/60 bg-[#eff4ff] text-[#45464d]">
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[32%]">
                      Candidate
                    </th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide text-center w-[13%]">
                      Score
                    </th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[13%]">
                      Semantic
                    </th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[11%]">Skill</th>
                    <th className="py-3 px-5 font-medium text-xs uppercase tracking-wide w-[19%]">Status</th>
                    <th className="py-3 px-5 w-[12%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c) => (
                    <Fragment key={c.id}>
                      <tr
                        className="border-b border-[#c6c6cd]/40 last:border-b-0 cursor-pointer hover:bg-[#eff4ff]/60 transition"
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      >
                        <td className="py-3 px-5 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={c.file_name} size={36} />
                            <span className="text-[#0b1c30] font-medium truncate">{c.file_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex justify-center">
                            <ScoreRing score={c.weighted_score} />
                          </div>
                        </td>
                        <td className="py-3 px-5 text-[#45464d]">{formatScore(c.semantic_score)}</td>
                        <td className="py-3 px-5 text-[#45464d]">{formatScore(c.skill_score)}</td>
                        <td className="py-3 px-5">
                          {c.unparseable ? (
                            <span className="inline-flex items-center gap-1.5 text-[#ba1a1a] text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                              Unparseable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#0c9488] text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0c9488]" />
                              Scored
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(c.id, c.file_name);
                            }}
                            className="text-[#8a8b93] hover:text-[#ba1a1a] text-xs font-medium transition"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                      {expandedId === c.id && (
                        <tr className="border-b border-[#c6c6cd]/40 bg-[#eff4ff]/40">
                          <td colSpan={6} className="py-5 px-5">
                            {c.unparseable ? (
                              <p className="text-[#ba1a1a] text-sm">
                                This resume could not be parsed (scanned image or corrupted file).
                                It was not scored.
                              </p>
                            ) : (
                              <div className="grid grid-cols-3 gap-6">
                                <div>
                                  <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-[#4648d4] mb-2.5">
                                    Matched Skills ({c.matched_skills?.length || 0})
                                  </h3>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(c.matched_skills || []).map((s) => (
                                      <span
                                        key={s}
                                        className="bg-[#e5eeff] text-[#4648d4] border border-[#4648d4]/20 text-xs font-medium px-2.5 py-1 rounded-full"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-[#ba1a1a] mb-2.5">
                                    Missing Skills ({c.missing_skills?.length || 0})
                                  </h3>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(c.missing_skills || []).map((s) => (
                                      <span
                                        key={s}
                                        className="bg-[#ffdad6]/40 text-[#ba1a1a] text-xs font-medium px-2.5 py-1 rounded-full"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-[#45464d] mb-2.5">
                                    Skill Coverage
                                  </h3>
                                  <SkillRadar
                                    taxonomy={taxonomy}
                                    jdSkills={job.jd_skills || []}
                                    matchedSkills={c.matched_skills || []}
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
          <div className="bg-[#131b2e] text-white rounded-xl p-5">
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
                  className="w-full accent-[#4648d4] h-1.5"
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
                  className="w-full accent-[#4648d4] h-1.5"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#c6c6cd]/60 rounded-xl shadow-sm p-5">
            <h4 className="font-heading text-sm font-semibold text-[#0b1c30] mb-4">Filters</h4>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#45464d] uppercase tracking-wide mb-1.5">
                Min Score:{" "}
                <span className="text-[#0b1c30] font-heading font-semibold normal-case">
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
                className="w-full accent-[#4648d4]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#45464d] uppercase tracking-wide mb-1.5">
                Must-Have Skill
              </label>
              <select
                value={mustHaveSkill}
                onChange={(e) => setMustHaveSkill(e.target.value)}
                className="w-full bg-[#eff4ff] border border-[#c6c6cd]/70 rounded-lg px-2.5 py-1.5 text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
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
                className="mt-4 text-sm text-[#4648d4] hover:underline font-medium"
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
