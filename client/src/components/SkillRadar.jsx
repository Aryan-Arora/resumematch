import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const CATEGORY_LABELS = {
  languages: "Languages",
  frameworks: "Frameworks",
  cloud: "Cloud",
  databases: "Databases",
  tools: "Tools",
};

export default function SkillRadar({ taxonomy, jdSkills, matchedSkills }) {
  if (!taxonomy) return null;

  const jdSet = new Set(jdSkills.map((s) => s.toLowerCase()));
  const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));

  const data = Object.entries(taxonomy)
    .map(([category, skills]) => {
      const required = skills.filter((s) => jdSet.has(s.toLowerCase()));
      if (required.length === 0) return null;
      const matched = required.filter((s) => matchedSet.has(s.toLowerCase()));
      return {
        category: CATEGORY_LABELS[category] || category,
        coverage: Math.round((matched.length / required.length) * 100),
      };
    })
    .filter(Boolean);

  if (data.length === 0) return <p className="text-sm text-gray-500">No categorized skills in this JD.</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#c6c6cd" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: "#45464d" }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#8a8b93" }} />
        <Radar
          name="Coverage"
          dataKey="coverage"
          stroke="#4648d4"
          fill="#4648d4"
          fillOpacity={0.35}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
