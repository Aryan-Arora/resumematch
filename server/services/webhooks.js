import crypto from "crypto";
import { supabase } from "../supabaseClient.js";
import { signWebhook } from "./webhookSignature.js";
import { validateWebhookUrl } from "./webhookUrl.js";
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS = [0, 1000, 5000];

export async function dispatchWebhook(orgId, eventType, payload) {
  const { data: hooks, error } = await supabase.from("organization_webhooks").select("id, url, secret, events").eq("org_id", orgId).eq("active", true);
  if (error || !hooks?.length) return;
  for (const hook of hooks) {
    if (Array.isArray(hook.events) && !hook.events.includes(eventType) && !hook.events.includes("*")) continue;
    const body = JSON.stringify({ id: crypto.randomUUID(), type: eventType, created_at: new Date().toISOString(), data: payload });
    const { data: delivery } = await supabase.from("webhook_deliveries").insert({ webhook_id: hook.id, org_id: orgId, event_type: eventType, payload, status: "pending", attempts: 0 }).select("id").single();
    if (!delivery) continue;
    let lastError = "";
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      if (RETRY_DELAYS[attempt]) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
      let url;
      try { url = await validateWebhookUrl(hook.url); } catch (error) { lastError = error.message; break; }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "user-agent": "ResumeMatch-Webhooks/1.0", "x-resumematch-signature": signWebhook(hook.secret, body), "x-resumematch-event": eventType }, body, signal: controller.signal });
        clearTimeout(timer);
        await supabase.from("webhook_deliveries").update({ attempts: attempt + 1, response_status: response.status, status: response.ok ? "delivered" : (attempt === MAX_ATTEMPTS - 1 ? "failed" : "pending"), last_error: response.ok ? null : `HTTP ${response.status}`, delivered_at: response.ok ? new Date().toISOString() : null, next_attempt_at: response.ok || attempt === MAX_ATTEMPTS - 1 ? null : new Date(Date.now() + RETRY_DELAYS[attempt + 1]).toISOString() }).eq("id", delivery.id);
        if (response.ok) break;
        lastError = `HTTP ${response.status}`;
      } catch (requestError) {
        clearTimeout(timer); lastError = requestError.name === "AbortError" ? "request timed out" : requestError.message;
        await supabase.from("webhook_deliveries").update({ attempts: attempt + 1, last_error: lastError, status: attempt === MAX_ATTEMPTS - 1 ? "failed" : "pending", next_attempt_at: attempt === MAX_ATTEMPTS - 1 ? null : new Date(Date.now() + RETRY_DELAYS[attempt + 1]).toISOString() }).eq("id", delivery.id);
      }
    }
    if (lastError) await supabase.from("webhook_deliveries").update({ last_error: lastError }).eq("id", delivery.id).eq("status", "pending");
  }
}

