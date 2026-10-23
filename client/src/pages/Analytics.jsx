import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { getAnalytics } from "../api";
import { useTheme } from "../theme";

const CHART_COLORS = {
  light: { grid: "#eff4ff", tick: "#45464d", accent: "#4648d4" },
  dark: { grid: "#171f33", tick: "#c7c4d7", accent: "#c0c1ff" },
};

function StatCard({ label, value }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-5 transition-colors">
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="font-heading text-2xl font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const colors = CHART_COLORS[theme];

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="p-10 text-[var(--color-danger)]">{error}</p>;
  if (!data) return <p className="p-10 text-[var(--color-text-muted)]">Loading analytics...</p>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="font-heading text-2xl font-semibold text-[var(--color-text)] mb-1">Analytics</h1>
      <p className="text-[var(--color-text-muted)] text-sm mb-6">
        Aggregate stats across all projects and candidates.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Projects" value={data.totalJobs} />
        <StatCard label="Total Candidates" value={data.totalCandidates} />
        <StatCard
          label="Avg. Match Score"
          value={data.avgScore !== null ? `${Math.round(data.avgScore * 100)}%` : "—"}
        />
        <StatCard label="Unparseable" value={data.unparseableCount} />
        <StatCard
          label="Feedback coverage"
          value={`${Math.round((data.calibration?.feedbackCoverage || 0) * 100)}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-5 transition-colors">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">
            Score Distribution
          </h2>
          {data.totalCandidates === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No scored candidates yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid stroke={colors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: colors.tick }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: colors.tick }} />
                <Bar dataKey="count" fill={colors.accent} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-5 transition-colors">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">
                Recruiter calibration
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Feedback helps you spot where recommendations need review.
              </p>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {data.calibration?.totalFeedback || 0} responses
            </span>
          </div>
          <div className="space-y-3">
            {[
              ["Accurate", "accurate", "text-emerald-500"],
              ["Inaccurate", "inaccurate", "text-[var(--color-danger)]"],
              ["Unclear", "unclear", "text-amber-500"],
            ].map(([label, key, color]) => {
              const count = data.calibration?.feedbackCounts?.[key] || 0;
              const average = data.calibration?.avgScoreByFeedback?.[key];
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className={`${color} font-medium`}>{label}</span>
                  <span className="text-[var(--color-text-muted)]">
                    {count} {count === 1 ? "response" : "responses"}
                    {average !== null && average !== undefined
                      ? ` · avg. score ${Math.round(average * 100)}%`
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-5 transition-colors">
          <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">
            Most Common Matched Skills
          </h2>
          {data.topSkills.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No skill data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topSkills} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke={colors.grid} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: colors.tick }} />
                <YAxis
                  type="category"
                  dataKey="skill"
                  width={110}
                  tick={{ fontSize: 11, fill: colors.tick }}
                />
                <Bar
                  dataKey="count"
                  fill={colors.accent}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
