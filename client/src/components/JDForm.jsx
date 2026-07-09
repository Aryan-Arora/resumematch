import { useEffect, useState } from "react";
import { createJob, getJobDomains } from "../api";

const DOMAIN_LABELS = {
  tech: "Tech",
  service_delivery: "Service Delivery",
  sales: "Sales",
  marketing: "Marketing",
  finance_accounting: "Finance & Accounting",
  hr_recruiting: "HR & Recruiting",
  general: "General (auto-extract keywords)",
};

export default function JDForm({ onJobCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJobDomains().then(setDomains).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const job = await createJob(title, description, domain);
      onJobCreated(job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-8 transition-colors">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-semibold text-[var(--color-text)]">New Job</h1>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          Paste the job description to start screening candidates.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-heading text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
              Job Title
            </label>
            <input
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              required
            />
          </div>
          <div>
            <label className="block font-heading text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
              Job Description
            </label>
            <textarea
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] h-56 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              required
            />
          </div>
          <div>
            <label className="block font-heading text-sm font-medium text-[var(--color-text-muted)] mb-1.5">
              Skill Domain
            </label>
            <select
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="">Auto-detect from description</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {DOMAIN_LABELS[d] || d}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-[var(--color-danger)] text-sm bg-[var(--color-danger-soft)]/40 border border-[var(--color-danger)]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Continue to Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
