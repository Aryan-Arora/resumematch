import crypto from "crypto";

export function signWebhook(secret, body) {
  return `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;
}

