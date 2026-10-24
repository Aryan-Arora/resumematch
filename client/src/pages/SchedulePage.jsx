import { useCallback, useEffect, useState } from "react";
import { API_BASE, bookPublicInterviewSlot, getPublicInterviewSlot } from "../api";

export default function SchedulePage({ token }) {
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState("");
  const loadSlot = useCallback(() => {
    setLoading(true);
    setMessage("");
    getPublicInterviewSlot(token).then(setSlot).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, [token]);
  useEffect(() => { loadSlot(); }, [loadSlot]);
  async function submit(event) {
    event.preventDefault(); setMessage(""); setSubmitting(true);
    try { const booking = await bookPublicInterviewSlot(token, { candidate_name: name, candidate_email: email }); setMessage(`Booked for ${new Date(booking.starts_at).toLocaleString()}. Add it to your calendar below.`); setCalendarUrl(`${API_BASE}/public/interview-slots/${encodeURIComponent(token)}/calendar.ics`); setSlot(null); }
    catch (error) { setMessage(error.message); }
    finally { setSubmitting(false); }
  }
  return <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-5 py-12">
    <section className="clay-card w-full max-w-lg p-7">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] mb-3">ResumeMatch scheduling</p>
      {loading ? <div className="space-y-3" aria-busy="true"><div className="h-7 w-56 rounded-lg bg-[var(--color-surface-high)] animate-pulse" /><div className="h-4 w-72 rounded bg-[var(--color-surface-high)] animate-pulse" /><div className="h-40 mt-6 rounded-xl bg-[var(--color-surface-high)] animate-pulse" /></div> : slot ? <><h1 className="font-heading text-2xl font-semibold text-[var(--color-text)]">Book your interview</h1><p className="mt-2 text-sm text-[var(--color-text-muted)]">{slot.job_title}<br />{new Date(slot.starts_at).toLocaleString()} – {new Date(slot.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{slot.location ? ` · ${slot.location}` : ""}</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm text-[var(--color-text-muted)]">Your name<input required value={name} onChange={(e) => setName(e.target.value)} maxLength={200} className="mt-1 w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)]" /></label><label className="block text-sm text-[var(--color-text-muted)]">Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={320} className="mt-1 w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)]" /></label><button disabled={submitting} className="clay-button w-full bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] rounded-lg py-2.5 font-medium disabled:opacity-50">{submitting ? "Booking…" : "Confirm interview time"}</button></form></> : <><h1 className="font-heading text-2xl font-semibold text-[var(--color-text)]">Interview slot unavailable</h1><p className="mt-2 text-sm text-[var(--color-text-muted)]">{message || "Ask the recruiter for another scheduling link."}</p>{message && <button onClick={loadSlot} className="clay-button mt-5 bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] rounded-lg px-4 py-2.5 text-sm font-medium">Try again</button>}</>}
      {message && slot && <div className="mt-5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-muted)]" role="status" aria-live="polite"><p>{message}</p>{calendarUrl && <a href={calendarUrl} className="inline-block mt-2 text-[var(--color-accent)] hover:underline">Download calendar event (.ics) →</a>}</div>}
    </section>
  </main>;
}
