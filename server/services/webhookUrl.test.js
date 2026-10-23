import { describe, expect, it } from "vitest";
import { validateWebhookUrl } from "./webhookUrl.js";

describe("webhook URL validation", () => {
  it("rejects local and private hosts before delivery", async () => {
    await expect(validateWebhookUrl("https://localhost/hook")).rejects.toThrow(/public/);
    await expect(validateWebhookUrl("https://127.0.0.1/hook")).rejects.toThrow(/public/);
    await expect(validateWebhookUrl("https://192.168.1.10/hook")).rejects.toThrow(/public/);
  });

  it("rejects non-HTTPS URLs", async () => {
    await expect(validateWebhookUrl("http://example.com/hook")).rejects.toThrow(/public/);
  });
});
