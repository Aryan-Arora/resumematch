import { useEffect, useState } from "react";
import { createOrganizationWebhook, deleteOrganizationWebhook, getOrganizationWebhooks, getWebhookDeliveries } from "../api";

export default function Settings() {
  const [hooks, setHooks] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState("candidate.screened");
  const [secret, setSecret] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try { const [webhooks, recent] = await Promise.all([getOrganizationWebhooks(), getWebhookDeliveries()]); setHooks(webhooks); setDeliveries(recent); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function addWebhook(event) {
    event.preventDefault(); setError(""); setSaving(true);
    try { const created = await createOrganizationWebhook({ url, events: events.split(",").map((item) => item.trim()).filter(Boolean) }); setSecret(created.secret); setUrl(""); await load(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function removeWebhook(id) {
    if (!window.confirm("Delete this webhook? Existing delivery history will also be removed.")) return;
    try { await deleteOrganizationWebhook(id); await load(); } catch (err) { setError(err.message); }
  }

  return <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">
    <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">Organization settings</h1>
    <p className="text-sm text-[var(--color-text-muted)] mt-1">Connect ResumeMatch to your ATS or internal workflow with signed webhook events.</p>
    {error && <p className="mt-4 text-sm text-[var(--color-danger)] bg-[var(--color-danger-soft)]/40 border border-[var(--color-danger)]/20 rounded-lg px-3 py-2">{error}</p>}
    {secret && <div className="mt-5 p-4 rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)]/30"><p className="text-sm font-semibold text-[var(--color-text)]">Copy this signing secret now</p><p className="text-xs text-[var(--color-text-muted)] mt-1">It is shown once. Store it in your receiving system and verify the raw request body.</p><code className="block mt-3 break-all text-xs text-[var(--color-text)]">{secret}</code><button onClick={() => setSecret(null)} className="mt-3 text-xs text-[var(--color-accent)] hover:underline">Hide secret</button></div>}
    <form onSubmit={addWebhook} className="mt-6 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
      <h2 className="font-heading font-semibold text-[var(--color-text)]">Add webhook</h2>
      <input required type="url" pattern="https://.*" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-ats.example/webhooks/resumematch" className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)]" />
      <input value={events} onChange={(e) => setEvents(e.target.value)} placeholder="candidate.screened, *" className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)]" />
      <button disabled={saving} className="bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? "Saving…" : "Create signed webhook"}</button>
    </form>
    <section className="mt-8"><h2 className="font-heading font-semibold text-[var(--color-text)]">Configured webhooks</h2><div className="mt-3 space-y-2">{hooks.length ? hooks.map((hook) => <div key={hook.id} className="flex items-center gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"><div className="flex-1 min-w-0"><p className="text-sm text-[var(--color-text)] truncate">{hook.url}</p><p className="text-xs text-[var(--color-text-muted)]">{(hook.events || []).join(", ")}</p></div><button onClick={() => removeWebhook(hook.id)} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button></div>) : <p className="text-sm text-[var(--color-text-muted)]">No webhooks configured.</p>}</div></section>
    <section className="mt-8"><h2 className="font-heading font-semibold text-[var(--color-text)]">Recent deliveries</h2><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="text-[var(--color-text-muted)]"><th className="py-2">Event</th><th>Status</th><th>Attempts</th><th>Response</th></tr></thead><tbody>{deliveries.map((delivery) => <tr key={delivery.id} className="border-t border-[var(--color-border)]"><td className="py-2 text-[var(--color-text)]">{delivery.event_type}</td><td className="text-[var(--color-text)]">{delivery.status}</td><td className="text-[var(--color-text-muted)]">{delivery.attempts}</td><td className="text-[var(--color-text-muted)]">{delivery.response_status || delivery.last_error || "—"}</td></tr>)}</tbody></table></div></section>
  </div>;
}

