import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { getAnalytics } from "../api";

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#c6c6cd]/60 rounded-xl shadow-sm p-5">
      <p className="text-xs font-medium text-[#45464d] uppercase tracking-wide mb-1">{label}</p>
      <p className="font-heading text-2xl font-semibold text-[#0b1c30]">{value}</p>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="p-10 text-[#ba1a1a]">{error}</p>;
  if (!data) return <p className="p-10 text-[#45464d]">Loading analytics...</p>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="font-heading text-2xl font-semibold text-[#0b1c30] mb-1">Analytics</h1>
      <p className="text-[#45464d] text-sm mb-6">
        Aggregate stats across all projects and candidates.
      </p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={data.totalJobs} />
        <StatCard label="Total Candidates" value={data.totalCandidates} />
        <StatCard
          label="Avg. Match Score"
          value={data.avgScore !== null ? `${Math.round(data.avgScore * 100)}%` : "—"}
        />
        <StatCard label="Unparseable" value={data.unparseableCount} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#c6c6cd]/60 rounded-xl shadow-sm p-5">
          <h2 className="font-heading text-sm font-semibold text-[#0b1c30] mb-4">
            Score Distribution
          </h2>
          {data.totalCandidates === 0 ? (
            <p className="text-sm text-[#45464d]">No scored candidates yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid stroke="#eff4ff" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#45464d" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#45464d" }} />
                <Bar dataKey="count" fill="#4648d4" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-[#c6c6cd]/60 rounded-xl shadow-sm p-5">
          <h2 className="font-heading text-sm font-semibold text-[#0b1c30] mb-4">
            Most Common Matched Skills
          </h2>
          {data.topSkills.length === 0 ? (
            <p className="text-sm text-[#45464d]">No skill data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topSkills} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#eff4ff" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#45464d" }} />
                <YAxis
                  type="category"
                  dataKey="skill"
                  width={110}
                  tick={{ fontSize: 11, fill: "#45464d" }}
                />
                <Bar dataKey="count" fill="#0c9488" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
