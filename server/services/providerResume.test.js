import { describe, expect, it } from "vitest";
import { validateProviderResumeUrl } from "./providerResume.js";

describe("provider resume URLs", () => {
  it("allows only provider-owned HTTPS hosts", () => {
    expect(validateProviderResumeUrl("greenhouse", "https://harvest.greenhouse.io/v1/attachments/a.pdf").hostname).toBe("harvest.greenhouse.io");
    expect(() => validateProviderResumeUrl("greenhouse", "http://harvest.greenhouse.io/a.pdf")).toThrow(/https/);
    expect(() => validateProviderResumeUrl("lever", "https://example.com/a.pdf")).toThrow(/not allowed/);
  });
});

