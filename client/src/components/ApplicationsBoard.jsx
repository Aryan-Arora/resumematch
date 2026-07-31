// The seeker's application tracker — a Kanban board over saved jobs. Stage moves
// use a per-card <select> (accessible, no drag-drop dependency). Columns scroll
// horizontally on narrow screens.
const STAGES = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

export default function ApplicationsBoard({ applications, onUpdateStatus, onDelete }) {
  if (applications.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]/60 rounded-lg px-3.5 py-3">
        No saved jobs yet. Save jobs from “Find jobs” and they’ll show up here to track.
      </p>
    );
  }

  const byStage = Object.fromEntries(STAGES.map((s) => [s.key, []]));
  for (const app of applications) {
    (byStage[app.status] || byStage.saved).push(app);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STAGES.map((stage) => (
        <div key={stage.key} className="flex-shrink-0 w-64">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {stage.label}
            </span>
            <span className="text-[11px] text-[var(--color-text-faint)]">
              {byStage[stage.key].length}
            </span>
          </div>
          <div className="space-y-2">
            {byStage[stage.key].length === 0 ? (
              <p className="text-[11px] text-[var(--color-text-faint)] px-1">—</p>
            ) : (
              byStage[stage.key].map((app) => (
                <div
                  key={app.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-lg p-3"
                >
                  <p className="text-sm font-medium text-[var(--color-text)] leading-snug">
                    {app.job_listings?.title || "Job"}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mb-2 truncate">
                    {[app.job_listings?.company, app.job_listings?.location]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                      className="flex-1 text-[11px] bg-[var(--color-surface-alt)] border border-[var(--color-border)]/60 rounded px-1.5 py-1 text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {app.job_listings?.url && (
                      <a
                        href={app.job_listings.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open posting"
                        className="text-[var(--color-text-faint)] hover:text-[var(--color-accent)]"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    )}
                    <button
                      onClick={() => onDelete(app.id)}
                      title="Remove from tracker"
                      className="text-[var(--color-text-faint)] hover:text-[var(--color-danger)]"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
