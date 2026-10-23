const FEEDBACK_VALUES = ["accurate", "inaccurate", "unclear"];

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

/** Summarize recruiter feedback against the model's scored recommendations. */
export function summarizeCalibration(candidates = []) {
  const feedbackCounts = Object.fromEntries(FEEDBACK_VALUES.map((value) => [value, 0]));
  const scoresByFeedback = Object.fromEntries(FEEDBACK_VALUES.map((value) => [value, []]));

  for (const candidate of candidates) {
    const feedback = candidate.match_feedback;
    if (!FEEDBACK_VALUES.includes(feedback)) continue;
    feedbackCounts[feedback] += 1;
    if (candidate.final_score !== null && candidate.final_score !== undefined) {
      scoresByFeedback[feedback].push(Number(candidate.final_score));
    }
  }

  const totalFeedback = Object.values(feedbackCounts).reduce((sum, count) => sum + count, 0);
  return {
    totalFeedback,
    feedbackCoverage: candidates.length ? totalFeedback / candidates.length : 0,
    feedbackCounts,
    avgScoreByFeedback: Object.fromEntries(
      FEEDBACK_VALUES.map((value) => [value, average(scoresByFeedback[value])]),
    ),
  };
}
