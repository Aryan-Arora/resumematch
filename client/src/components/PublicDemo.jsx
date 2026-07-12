import { useEffect, useState } from "react";
import { classifyPreview } from "../api";
import { getTheme, toggleTheme } from "../theme";
import Logo from "./Logo";

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
  general: "General — extracted directly from this JD",
};

const EXAMPLES = [
  {
    label: "Electrician",
    text: "Licensed Electrician needed for residential wiring, panel upgrades, and code compliance inspections. OSHA 30 and journeyman license required.",
  },
  {
    label: "Certified Nursing Assistant",
    text: "Certified Nursing Assistant responsible for patient care, vital signs monitoring, and mobility assistance in a skilled nursing facility. CNA and CPR certification required.",
  },
  {
    label: "Beekeeper",
    text: "Commercial beekeeper needed to manage hive inspections, swarm management, honey extraction, and seasonal colony management across 200 hives.",
  },
];

export default function PublicDemo() {
  const [theme, setThemeState] = useState("light");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await classifyPreview(description);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <Logo size={32} className="rounded-[10px]" />
            <span className="font-heading text-lg font-bold text-[var(--color-text)]">
              ResumeMatch
            </span>
          </div>
          <button
            onClick={() => setThemeState(toggleTheme())}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)] transition"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>

        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-2">
          Does this work for your job, not just tech roles?
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mb-8">
          Paste any job description — electrician, nurse, warehouse lead, anything. No account
          needed. We'll show you exactly what our matching engine detects before you trust it
          with real resumes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste a job description here..."
            required
            className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] h-40 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition resize-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--color-text-faint)]">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setDescription(ex.text)}
                className="text-xs px-2.5 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition"
              >
                {ex.label}
              </button>
            ))}
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
            {loading ? "Analyzing..." : "Detect skills"}
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-[var(--color-text-faint)] uppercase tracking-wide">
                Detected domain
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-full px-2 py-1">
                {DOMAIN_LABELS[result.domain] || result.domain}
              </span>
            </div>
            <span className="text-xs font-medium text-[var(--color-text-faint)] uppercase tracking-wide">
              Extracted requirements ({result.skills.length})
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.skills.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  No specific requirements detected — try a fuller description.
                </p>
              ) : (
                result.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/60 text-[var(--color-text)]"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-[var(--color-border)]/60 text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-3">
            This is the same engine that screens real resumes against these requirements —
            including skills candidates never wrote down explicitly.
          </p>
          <a
            href="/"
            className="inline-block bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-5 py-2.5 rounded-lg transition"
          >
            Sign up to screen real resumes →
          </a>
        </div>
      </div>
    </div>
  );
}
