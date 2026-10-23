import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_RETENTION_DAYS,
  MAX_RETENTION_DAYS,
  MIN_RETENTION_DAYS,
  getRetentionDays,
} from "./retentionConfig.js";

const original = process.env.RETENTION_DAYS;

afterEach(() => {
  if (original === undefined) delete process.env.RETENTION_DAYS;
  else process.env.RETENTION_DAYS = original;
});

describe("getRetentionDays", () => {
  it("uses the documented default", () => {
    delete process.env.RETENTION_DAYS;
    expect(getRetentionDays()).toBe(DEFAULT_RETENTION_DAYS);
  });

  it("clamps an operational setting to safe bounds", () => {
    process.env.RETENTION_DAYS = "1";
    expect(getRetentionDays()).toBe(MIN_RETENTION_DAYS);
    process.env.RETENTION_DAYS = "99999";
    expect(getRetentionDays()).toBe(MAX_RETENTION_DAYS);
    process.env.RETENTION_DAYS = "not-a-number";
    expect(getRetentionDays()).toBe(DEFAULT_RETENTION_DAYS);
  });
});
