import { describe, expect, it } from "vitest";
import { summarizeCalibration } from "./calibration.js";

describe("summarizeCalibration", () => {
  it("counts feedback and compares average scores by feedback", () => {
    const result = summarizeCalibration([
      { match_feedback: "accurate", final_score: 0.8 },
      { match_feedback: "inaccurate", final_score: 0.4 },
      { match_feedback: "accurate", final_score: 0.6 },
      { match_feedback: "unclear", final_score: null },
      { match_feedback: null, final_score: 0.9 },
    ]);

    expect(result.totalFeedback).toBe(4);
    expect(result.feedbackCoverage).toBe(0.8);
    expect(result.feedbackCounts).toEqual({ accurate: 2, inaccurate: 1, unclear: 1 });
    expect(result.avgScoreByFeedback.accurate).toBeCloseTo(0.7);
    expect(result.avgScoreByFeedback.unclear).toBeNull();
  });

  it("returns an empty safe summary", () => {
    expect(summarizeCalibration()).toEqual({
      totalFeedback: 0,
      feedbackCoverage: 0,
      feedbackCounts: { accurate: 0, inaccurate: 0, unclear: 0 },
      avgScoreByFeedback: { accurate: null, inaccurate: null, unclear: null },
    });
  });
});
