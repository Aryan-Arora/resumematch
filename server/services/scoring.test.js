import { describe, it, expect } from "vitest";
import { computeFinalScore } from "./scoring.js";

describe("computeFinalScore", () => {
  it("applies the default 60/40 semantic/skill weighting", () => {
    expect(computeFinalScore(1, 1)).toBe(1);
    expect(computeFinalScore(0, 0)).toBe(0);
    expect(computeFinalScore(1, 0)).toBe(0.6);
    expect(computeFinalScore(0, 1)).toBe(0.4);
  });

  it("respects custom weights", () => {
    expect(computeFinalScore(1, 0, { semantic: 0.5, skill: 0.5 })).toBe(0.5);
    expect(computeFinalScore(0.5, 0.5, { semantic: 1, skill: 0 })).toBe(0.5);
  });

  it("rounds to 3 decimal places", () => {
    expect(computeFinalScore(0.7708, 1)).toBe(0.862);
  });
});
