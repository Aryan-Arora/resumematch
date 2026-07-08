export function computeFinalScore(semanticScore, skillScore, weights = { semantic: 0.6, skill: 0.4 }) {
  const final = semanticScore * weights.semantic + skillScore * weights.skill;
  return Math.round(final * 1000) / 1000;
}
