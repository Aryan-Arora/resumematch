import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../theme";

const CATEGORY_LABELS = {
  languages: "Languages",
  frameworks: "Frameworks",
  cloud: "Cloud",
  databases: "Databases",
  tools: "Tools",
};

const RADAR_COLORS = {
  light: { grid: "#c6c6cd", angleTick: "#45464d", radiusTick: "#8a8b93", accent: "#4648d4" },
  dark: { grid: "#464554", angleTick: "#c7c4d7", radiusTick: "#908fa0", accent: "#c0c1ff" },
};

export default function SkillRadar({ taxonomy, jdSkills, matchedSkills }) {
  const theme = useTheme();
  const colors = RADAR_COLORS[theme];

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

  if (data.length === 0)
    return <p className="text-sm text-[var(--color-text-muted)]">No categorized skills in this JD.</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke={colors.grid} />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: colors.angleTick }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: colors.radiusTick }} />
        <Radar
          name="Coverage"
          dataKey="coverage"
          stroke={colors.accent}
          fill={colors.accent}
          fillOpacity={0.35}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
