import { useCallback, useEffect, useState } from "react";
import {
  getSeekerResumes,
  uploadSeekerResume,
  getSeekerMatches,
  explainSeekerMatch,
  deleteSeekerResume,
  setSeekerResumeVisibility,
} from "../api";
import { useSession } from "../auth";
import { supabase } from "../supabaseClient";
import { getTheme, toggleTheme } from "../theme";
import Logo from "./Logo";
import ScoreRing from "./ScoreRing";

const SOURCE_LABELS = { adzuna: "Adzuna", greenhouse: "Greenhouse", lever: "Lever" };

// One ranked job. Fetches its "why / gap" explanation lazily the first time the
// seeker expands it (the matches list stays fast; the explanation reuses the
// recruiter engine's skill comparison server-side).
function JobMatchCard({ job, resumeId }) {
  const [expanded, setExpanded] = useState(false);
  const [explain, setExplain] = useState(null); // { loading, data, error }

  async function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && !explain) {
      setExplain({ loading: true });
      try {
        const data = await explainSeekerMatch(resumeId, job.id);
        setExplain({ loading: false, data });
      } catch (err) {
        setExplain({ loading: false, error: err.message });
      }
    }
  }

  const score = job.weighted_similarity ?? job.similarity;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={score} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-sm font-semibold text-[var(--color-text)] truncate">
              {job.title}
            </h3>
            {job.source_type === "full_text" && (
              <span className="text-[10px] uppercase tracking-wide text-[var(--color-success)] bg-[var(--color-success-soft)]/30 rounded-full px-1.5 py-0.5">
                full text
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] truncate">
            {[job.company, job.location].filter(Boolean).join(" · ") ||
              SOURCE_LABELS[job.source] ||
              job.source}
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
                  Why you match ({explain.data.why_matched.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {explain.data.why_matched.length === 0 ? (
                    <span className="text-[11px] text-[var(--color-text-faint)]">
                      No direct skill overlap detected
                    </span>
                  ) : (
                    explain.data.why_matched.map((s) => (
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
                  The gap ({explain.data.gaps.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {explain.data.gaps.length === 0 ? (
                    <span className="text-[11px] text-[var(--color-text-faint)]">
                      Nothing major missing
                    </span>
                  ) : (
                    explain.data.gaps.map((s) => (
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
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-button inline-flex items-center gap-1 mt-4 bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] font-heading font-medium text-xs px-3.5 py-2 rounded-lg hover:opacity-90 transition"
            >
              View &amp; apply
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// The seeker front door: upload a résumé, get live jobs ranked by fit, with why
// you match and where the gaps are. Same engine as the recruiter side, query
// reversed (résumé -> jobs). Mounted at /seeker behind auth but NOT org-gated.
export default function SeekerApp() {
  const session = useSession();
  const [theme, setThemeState] = useState("light");
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const loadResumes = useCallback(async () => {
    setLoadingResumes(true);
    try {
      const data = await getSeekerResumes();
      setResumes(data);
      setError(null);
      if (data.length > 0) setSelectedId((cur) => cur || data[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingResumes(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const loadMatches = useCallback(async (resumeId) => {
    if (!resumeId) return;
    setLoadingMatches(true);
    try {
      const data = await getSeekerMatches(resumeId);
      setMatches(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadMatches(selectedId);
  }, [selectedId, loadMatches]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const created = await uploadSeekerResume(file);
      await loadResumes();
      setSelectedId(created.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this résumé?")) return;
    await deleteSeekerResume(id);
    setResumes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id || null);
      return next;
    });
  }

  async function handleToggleVisibility(id, current) {
    try {
      const updated = await setSeekerResumeVisibility(id, !current);
      setResumes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, visible_to_recruiters: updated.visible_to_recruiters } : r
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  const selectedResume = resumes.find((r) => r.id === selectedId);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2.5">
            <Logo size={32} className="rounded-[10px]" />
            <span className="font-heading text-lg font-bold text-[var(--color-text)]">
              ResumeMatch
            </span>
            <span className="text-[10px] uppercase tracking-wide text-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-full px-2 py-0.5">
              Job Seeker
            </span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setThemeState(toggleTheme())}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)] transition"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            {session?.user?.email && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition"
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-1">
          Find jobs that fit you
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mb-8">
          Upload your résumé and get live jobs ranked by fit — with why you match and where the gaps
          are.
        </p>

        {error && (
          <p className="text-[var(--color-danger)] text-sm bg-[var(--color-danger-soft)]/40 border border-[var(--color-danger)]/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="clay-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--color-text-faint)] uppercase tracking-wide">
              Your résumé
            </span>
            <label className="clay-button cursor-pointer inline-flex items-center gap-1 bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] font-heading font-medium text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              {uploading ? "Uploading…" : resumes.length > 0 ? "Upload another" : "Upload résumé"}
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {loadingResumes ? (
            <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
          ) : resumes.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No résumé yet — upload a .pdf or .docx to see matching jobs.
            </p>
          ) : (
            <div className="space-y-2">
              {resumes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 border transition cursor-pointer ${
                    selectedId === r.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/40"
                      : "border-[var(--color-border)]/60 hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-[var(--color-text-faint)]">
                    description
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--color-text)] truncate">{r.file_name}</p>
                    {r.unparseable && (
                      <p className="text-[11px] text-[var(--color-danger)]">Could not read this file</p>
                    )}
                  </div>
                  <label
                    className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                    title="Let recruiters discover you (opt-in)"
                  >
                    <input
                      type="checkbox"
                      checked={!!r.visible_to_recruiters}
                      onChange={() => handleToggleVisibility(r.id, r.visible_to_recruiters)}
                    />
                    Visible to recruiters
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(r.id);
                    }}
                    title="Delete résumé"
                    className="text-[var(--color-text-faint)] hover:text-[var(--color-danger)]"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedResume && !selectedResume.unparseable && (
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-[var(--color-text-faint)] uppercase tracking-wide">
              Jobs ranked for {selectedResume.file_name}
            </h2>
            {loadingMatches ? (
              <p className="text-sm text-[var(--color-text-muted)]">Finding your best matches…</p>
            ) : matches.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]/60 rounded-lg px-3.5 py-3">
                No jobs in the corpus yet. Once jobs are ingested (<code>npm run ingest</code>), your
                matches show up here.
              </p>
            ) : (
              matches.map((job) => <JobMatchCard key={job.id} job={job} resumeId={selectedId} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
