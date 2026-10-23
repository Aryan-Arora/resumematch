import { useState } from "react";
import { useSEO } from "../lib/seo";
import Logo from "./Logo";
import { submitDeletionRequest } from "../api";

export default function PrivacyRequestPage() {
  useSEO({
    title: "Candidate privacy request",
    description: "Request deletion of your resume and candidate data from ResumeMatch.",
    path: "/privacy-request",
  });
  const [organizationId, setOrganizationId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitDeletionRequest({ organization_id: organizationId.trim(), email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "We could not submit the request. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 py-12">
      <div className="max-w-xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 mb-12" aria-label="ResumeMatch home">
          <Logo size={32} className="rounded-[12px]" />
          <span className="font-heading font-bold">ResumeMatch</span>
        </a>
        <div className="clay-card p-7 sm:p-9">
          <h1 className="font-heading text-2xl font-semibold mb-2">Request data deletion</h1>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
            If a recruiter used ResumeMatch to screen your resume, you can ask the organization to
            remove your candidate record and stored resume. Use the organization ID shown by the
            recruiter and the email address on your resume.
          </p>
          {submitted ? (
            <div className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-4 text-sm text-[var(--color-text)]">
              Your request was received. The organization will review it and remove matching data
              when the request is approved. This response does not reveal whether a matching record exists.
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm text-[var(--color-text-muted)]">Organization ID
                <input required value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="mt-1.5 w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)]" />
              </label>
              <label className="block text-sm text-[var(--color-text-muted)]">Email used on the resume
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)]" />
              </label>
              {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
              <button disabled={submitting} className="clay-button w-full bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] font-heading font-medium py-3 rounded-xl disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit privacy request"}
              </button>
            </form>
          )}
          <p className="text-xs text-[var(--color-text-faint)] mt-6">
            ResumeMatch returns the same confirmation whether or not a matching record exists.
            This protects candidate privacy.
          </p>
        </div>
        <p className="text-center text-xs text-[var(--color-text-faint)] mt-6"><a href="/privacy" className="hover:underline">Privacy policy</a> · <a href="/" className="hover:underline">Home</a></p>
      </div>
    </main>
  );
}
