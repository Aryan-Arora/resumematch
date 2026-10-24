import { useEffect, useState } from "react";
import { createJob, getJobDomains } from "../api";

const DOMAIN_LABELS = {
  tech: "Tech",
  service_delivery: "Service Delivery",
  sales: "Sales",
  marketing: "Marketing",
  finance_accounting: "Finance & Accounting",
  hr_recruiting: "HR & Recruiting",
  skilled_trades: "Skilled Trades",
  healthcare_support: "Healthcare Support",
  hospitality_food_service: "Hospitality & Food Service",
  logistics_warehouse: "Logistics & Warehouse",
  engineering: "Engineering",
  education: "Education",
  legal: "Legal",
  creative_design: "Creative & Design",
  manufacturing_production: "Manufacturing & Production",
  general: "General (auto-extract keywords)",
};

export default function JDForm({ onJobCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [interviewUrl, setInterviewUrl] = useState("");
  const [mustHave, setMustHave] = useState("");
  const [preferred, setPreferred] = useState("");
  const [disqualifiers, setDisqualifiers] = useState("");
  const [certifications, setCertifications] = useState("");
  const [locations, setLocations] = useState("");
  const [workAuthorization, setWorkAuthorization] = useState("");
  const [minimumYears, setMinimumYears] = useState("");
  const [emailTemplates, setEmailTemplates] = useState({ shortlist: "", interview: "", rejection: "" });
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
      const lines = (value) => value.split("\n").map((item) => item.trim()).filter(Boolean);
      const job = await createJob(title, description, domain, interviewUrl, { must_have: lines(mustHave), preferred: lines(preferred), disqualifiers: lines(disqualifiers), certifications: lines(certifications), locations: lines(locations), work_authorization: lines(workAuthorization), minimum_years: minimumYears ? Number(minimumYears) : null }, emailTemplates);
      onJobCreated(job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 lg:py-10">
      <div className="clay-card p-6 sm:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <label className="block font-heading text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Interview scheduling link <span className="font-normal text-xs text-[var(--color-text-faint)]">(optional)</span></label>
            <input className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" value={interviewUrl} onChange={(e) => setInterviewUrl(e.target.value)} placeholder="https://calendly.com/your-team/interview" type="url" />
            <p className="text-xs text-[var(--color-text-faint)] mt-1">Use a Calendly, Google Calendar appointment, or other HTTPS booking link.</p>
          </div>
          <details className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-alt)]/50 p-4">
            <summary className="cursor-pointer text-sm font-medium text-[var(--color-text)]">Structured eligibility gates <span className="font-normal text-xs text-[var(--color-text-faint)]">(optional, missing evidence goes to review)</span></summary>
            <p className="text-xs text-[var(--color-text-faint)] mt-2">Use these for requirements that need an explicit recruiter check. ResumeMatch never auto-rejects a candidate only because one of these phrases is absent.</p>
            <div className="grid gap-3 sm:grid-cols-2 mt-3">
              {[["Required certifications or licenses", certifications, setCertifications, "e.g. RN license (one per line)"], ["Required locations", locations, setLocations, "e.g. Bengaluru (one per line)"], ["Work authorization evidence", workAuthorization, setWorkAuthorization, "e.g. authorised to work in India" ]].map(([label, value, setter, placeholder]) => <label key={label} className="text-xs text-[var(--color-text-muted)]">{label}<textarea value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} className="mt-1 w-full min-h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] resize-y" /></label>)}
              <label className="text-xs text-[var(--color-text-muted)]">Minimum years of experience<input type="number" min="1" max="60" value={minimumYears} onChange={(e) => setMinimumYears(e.target.value)} placeholder="e.g. 5" className="mt-1 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)]" /></label>
            </div>
          </details>
          <div className="grid gap-4 sm:grid-cols-3">
            {[['Must-have requirements', mustHave, setMustHave, 'One requirement per line'], ['Preferred requirements', preferred, setPreferred, 'Nice to have'], ['Disqualifiers', disqualifiers, setDisqualifiers, 'One automatic review flag per line']].map(([label, value, setter, placeholder]) => <label key={label} className="text-sm font-medium text-[var(--color-text-muted)]">{label}<textarea value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} className="mt-1.5 w-full min-h-24 bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] resize-y" /></label>)}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-accent)] font-semibold">Step 1 of 2</p>
            <h1 className="font-heading text-2xl font-semibold text-[var(--color-text)]">Create a screening project</h1>
          </div>
        </div>
          <p className="text-[var(--color-text-muted)] text-sm mb-7">
          Tell us what good looks like. We’ll extract requirements and use them to explain every candidate match.
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
              maxLength={5000}
            />
            <div className="flex justify-between mt-1.5 text-xs text-[var(--color-text-faint)]"><span>Include responsibilities, must-have skills, and experience.</span><span>{description.length}/5000</span></div>
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
          <details className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface-alt)]/50 p-4">
            <summary className="cursor-pointer text-sm font-medium text-[var(--color-text)]">Customize recruiter email templates <span className="font-normal text-xs text-[var(--color-text-faint)]">(optional)</span></summary>
            <p className="text-xs text-[var(--color-text-faint)] mt-2">Leave blank to use ResumeMatch defaults. Use candidateName, jobTitle, and orgName placeholders where needed.</p>
            <div className="grid gap-3 mt-3">
              {[['shortlist', 'Shortlist message'], ['interview', 'Interview invite'], ['rejection', 'Rejection message']].map(([key, label]) => <label key={key} className="text-xs text-[var(--color-text-muted)]">{label}<textarea value={emailTemplates[key]} onChange={(e) => setEmailTemplates((prev) => ({ ...prev, [key]: e.target.value }))} maxLength={5000} placeholder="Write a concise, human message..." className="mt-1 w-full min-h-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] resize-y" /></label>)}
            </div>
          </details>
          {error && (
            <p className="text-[var(--color-danger)] text-sm bg-[var(--color-danger-soft)]/40 border border-[var(--color-danger)]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="clay-button w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-3 rounded-xl disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Continue to Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
