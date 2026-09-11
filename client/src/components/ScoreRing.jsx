// Circular match-score ring (conic-gradient). Shared by the recruiter candidate
// table and the seeker job matches — the same visual for "how strong is this
// match", pointed in either direction. `score` is a 0–1 fraction.
export default function ScoreRing({ score }) {
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
