import { describe, expect, it } from "vitest";
import { signWebhook } from "./webhookSignature.js";

describe("webhook signatures", () => {
  it("produces a stable HMAC signature for the raw body", () => {
    expect(signWebhook("secret", "{}")).toBe("sha256=77325902caca812dc259733aacd046b73817372c777b8d95b402647474516e13");
  });
});

