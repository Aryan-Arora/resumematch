import { track } from "@vercel/analytics";

// Keep product events in one place so analytics failures never interrupt the
// demo. Vercel Analytics is client-only; the guard also keeps local previews
// and tests quiet when tracking is unavailable.
export function trackEvent(name, properties = {}) {
  try {
    track(name, properties);
  } catch {
    // Analytics should never block a user's hiring workflow.
  }
}
