import { describe, it, expect } from "vitest";
import { isInternalTestTraffic } from "./testTraffic.js";

describe("isInternalTestTraffic", () => {
  it("flags the smoke test user agent", () => {
    expect(isInternalTestTraffic("Mozilla/5.0 Chrome/120 ResumeMatchSmokeTest")).toBe(true);
  });
  it("does not flag normal browsers or missing user agents", () => {
    expect(isInternalTestTraffic("Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/120")).toBe(false);
    expect(isInternalTestTraffic(undefined)).toBe(false);
  });
});
