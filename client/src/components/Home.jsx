import { useEffect, useRef, useState } from "react";
import { getTheme, toggleTheme, applyStoredTheme } from "../theme";
import { useSEO, useJsonLd } from "../lib/seo";
import Logo from "./Logo";
import StreamlinedJourney from "./StreamlinedJourney";

// Fires `data-visible` once when the element enters the viewport — the
// scroll-reveal recipe never re-animates on scroll-by.
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    // Safety net: never leave content permanently clipped if IO misbehaves
    // (very tall sections that never cross the threshold, odd viewports, etc).
    const fallback = setTimeout(() => setVisible(true), 2500);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return [ref, visible];
}

function Reveal({ as: Tag = "div", stagger, className = "", children }) {
  const [ref, visible] = useReveal();
  const classes = `${stagger ? "reveal-stagger" : "reveal"} ${className}`;
  return (
    <Tag ref={ref} className={classes} data-visible={visible || undefined}>
      {children}
    </Tag>
  );
}

const ROTATING_AUDIENCES = [
  "any hiring team",
  "skilled trades",
  "healthcare hiring",
  "sales floors",
  "warehouse ops",
  "hospitality crews",
];

function RotatingHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ROTATING_AUDIENCES.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <h1
      className="font-heading text-4xl md:text-5xl font-bold text-[var(--color-text)] tracking-tight text-balance"
      style={{ animation: "jRise .6s cubic-bezier(.22,1,.36,1) both" }}
    >
      Explainable resume screening for
      <br />
      <span
        key={index}
        className="inline-block text-[var(--color-accent)] italic"
        style={{ animation: "jRise .5s cubic-bezier(.22,1,.36,1) both" }}
      >
        {ROTATING_AUDIENCES[index]}
      </span>
    </h1>
  );
}

const DOMAINS = [
  { icon: "code", label: "Tech" },
  { icon: "support_agent", label: "Service Delivery" },
  { icon: "trending_up", label: "Sales" },
  { icon: "campaign", label: "Marketing" },
  { icon: "account_balance", label: "Finance & Accounting" },
  { icon: "groups", label: "HR & Recruiting" },
  { icon: "construction", label: "Skilled Trades" },
  { icon: "medical_services", label: "Healthcare Support" },
  { icon: "restaurant", label: "Hospitality & Food Service" },
  { icon: "local_shipping", label: "Logistics & Warehouse" },
  { icon: "precision_manufacturing", label: "Engineering" },
  { icon: "school", label: "Education" },
  { icon: "gavel", label: "Legal" },
  { icon: "palette", label: "Creative & Design" },
  { icon: "factory", label: "Manufacturing & Production" },
];

const FAQS = [
  {
    q: "Is ResumeMatch free to use?",
    a: "Yes, it's free during early access. If paid plans are introduced later, pricing will be shown up front before anything changes for existing users.",
  },
  {
    q: "Does my resume data get sent to a third-party AI API?",
    a: "No. Matching runs on local embeddings on our own servers — resume content never leaves our infrastructure to be scored by an outside AI provider.",
  },
  {
    q: "Does it only work for tech roles?",
    a: "No. The same matching engine screens skilled trades, healthcare support, hospitality, logistics, sales, and any other job domain — not just software roles.",
  },
  {
    q: "Do I need an account to try it?",
    a: "No. The free demo requires no signup, and nothing you submit there is saved — it exists only in your browser session.",
  },
  {
    q: "How is this different from a black-box AI score?",
    a: "Every match shows matched, missing, and implied skills, each with the evidence sentence pulled straight from the resume — so you can see exactly why a candidate scored the way they did, not just a number.",
  },
  {
    q: "How does AI resume screening actually work?",
    a: "Resumes and job descriptions are converted into embeddings — a representation of meaning, not just exact words — so \"led a team of engineers\" and \"managed an engineering team\" register as similar even without shared wording. Each requirement in the JD is compared against the resume's content, and the per-requirement breakdown is kept rather than collapsed into a single score.",
  },
  {
    q: "Is there a good ATS alternative for small teams or agencies?",
    a: "ResumeMatch isn't a full applicant-tracking system — it's focused specifically on the screening and shortlisting step. It works well as a lightweight alternative for small recruiting teams and agencies who want explainable matching without an enterprise ATS contract, and organizations can invite teammates to share the same jobs and candidates via a join code.",
  },
  {
    q: "What resume file formats can I upload?",
    a: "PDF and DOCX. Bulk upload is supported, and parsing happens on our own infrastructure — resumes aren't routed through a third-party document-parsing API.",
  },
];

const KPIS = [
  { value: "15+", label: "Hiring domains covered", desc: "Tech to skilled trades, legal to manufacturing" },
  { value: "$0", label: "Per-resume API cost", desc: "Matching runs on local embeddings, not a paid AI API" },
  { value: "3", label: "Skill signals per match", desc: "Matched, missing, and implied — with evidence" },
  { value: "2", label: "Resume formats supported", desc: "PDF and DOCX" },
];

export default function Home() {
  const [theme, setThemeState] = useState("light");
  const [openFaq, setOpenFaq] = useState(0);

  useSEO({
    title: "Explainable AI Resume Screening for Recruiters",
    description:
      "Free AI resume screening software with explainable candidate matching. Paste a job description, upload resumes, and get a ranked shortlist with matched, missing, and implied skills — not a black-box score. An ATS alternative for recruiters, HR teams, and agencies, for tech and non-tech roles alike.",
    path: "/",
  });

  useJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });

  useEffect(() => {
    applyStoredTheme();
    setThemeState(getTheme());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <header className="fixed top-0 w-full z-50 bg-[var(--color-surface)]/60 backdrop-blur-xl border-b border-[var(--color-border)]/40">
        <div className="h-20 w-full px-6 md:px-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={32} className="rounded-[10px]" />
            <span className="font-heading text-lg font-bold text-[var(--color-text)]">
              ResumeMatch
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setThemeState(toggleTheme())}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)] transition"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <a
              href="/blog"
              className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            >
              Blog
            </a>
            <a
              href="/demo"
              className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            >
              Continue as Guest
            </a>
            <a
              href="/login"
              className="clay-button px-6 py-2.5 bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] rounded-full font-heading font-medium text-sm transition"
            >
              Sign In / Sign Up
            </a>
          </div>
        </div>
      </header>

      <main className="w-full pt-20">
        {/* Hero */}
        <section className="relative w-full overflow-hidden px-6 md:px-16 py-24 flex flex-col items-center">
          <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-[var(--color-accent)]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-[-5%] w-[500px] h-[500px] bg-[var(--color-implied)]/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-3xl text-center">
            <div className="mb-8">
              <RotatingHeadline />
            </div>
            <div className="max-w-xl mx-auto">
              <a
                href="/demo"
                className="clay-button group relative flex items-center gap-4 p-2 pl-6 bg-[var(--color-surface)] rounded-full shadow-lg ring-1 ring-[var(--color-border)]/60 hover:ring-[var(--color-accent)]/40 transition"
              >
                <span className="material-symbols-outlined text-[var(--color-accent)]">search</span>
                <span className="flex-1 text-left text-sm text-[var(--color-text-faint)]">
                  Try it with your own job description...
                </span>
                <span className="bg-[var(--color-accent)] text-[var(--color-accent-contrast)] px-6 py-3 rounded-full text-sm font-heading font-medium">
                  Continue
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full px-6 md:px-16 py-20">
          <StreamlinedJourney />
        </section>

        {/* KPIs */}
        <section className="w-full px-6 md:px-16 py-16 bg-[var(--color-surface)]">
          <Reveal stagger className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="clay-card p-6 text-center">
                <div className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-accent)] mb-1">
                  {kpi.value}
                </div>
                <div className="text-sm font-medium text-[var(--color-text)] mb-1">{kpi.label}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{kpi.desc}</div>
              </div>
            ))}
          </Reveal>
        </section>

        {/* Value props */}
        <section className="w-full px-6 md:px-16 py-16">
          <Reveal stagger className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValueCard
              icon="auto_awesome"
              iconColor="var(--color-accent)"
              title="Explainable shortlists"
              desc="Every score comes with matched, missing, and implied skills — including the evidence sentence for skills a candidate never explicitly listed."
            />
            <ValueCard
              icon="domain"
              iconColor="var(--color-implied)"
              title="Works beyond tech roles"
              desc="Electricians, CNAs, warehouse leads — the same engine screens any job domain, not just software roles."
            />
            <ValueCard
              icon="savings"
              iconColor="var(--color-success)"
              title="No per-resume API cost"
              desc="Matching runs on local embeddings, so screening volume doesn't turn into a runaway AI bill."
            />
          </Reveal>
        </section>

        <section className="w-full px-6 md:px-16 pb-20">
          <div className="max-w-6xl mx-auto clay-card p-7 md:p-9">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-accent)] font-semibold mb-2">Explore ResumeMatch</p>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-text)] mb-5">Find the screening workflow that fits your team</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {[["/free-resume-screening-software", "Free resume screening software"], ["/explainable-ai-resume-screening", "Explainable AI screening"], ["/ats-alternative-for-recruiters", "ATS alternative for recruiters"]].map(([href, label]) => <a key={href} href={href} className="glass-panel p-4 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]">{label}<span className="block text-xs text-[var(--color-text-faint)] mt-1">Learn more →</span></a>)}
            </div>
          </div>
        </section>

        {/* Preview */}
        <Reveal as="section" className="w-full px-6 md:px-16 py-20 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-text)] mb-5">
              See the reasoning, not just a score
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8 max-w-md">
              The candidate table isn't a dead end — it's a working shortlist. Adjust weighting,
              filter by must-have skill, and shortlist candidates for the physical round straight
              from the row.
            </p>
            <ul className="space-y-4">
              {["Adjustable semantic vs. skill weighting", "Matched, implied, and missing skills per candidate", "One-click shortlist email to the candidate"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-[var(--color-text)]">
                    <span className="material-symbols-outlined text-[var(--color-accent)] bg-[var(--color-accent-soft)] p-1 rounded-full text-[16px]">
                      check
                    </span>
                    <span className="text-sm">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="clay-card p-6 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-heading text-sm font-semibold text-[var(--color-text)]">
                  Warehouse Operations Lead
                </h4>
                <span className="px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="space-y-3">
                <PreviewRow initials="DM" name="Dwayne M." meta="93% Match" highlight />
                <PreviewRow initials="PN" name="Priya N." meta="63% Match" />
                <PreviewRow initials="MD" name="Marcus D." meta="23% Match" faded />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Domain coverage */}
        <section className="w-full px-6 md:px-16 py-20 bg-[var(--color-surface)]">
          <Reveal className="max-w-6xl mx-auto text-center mb-12">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-text)] mb-3">
              One matching engine, every hiring domain
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              The same explainable matching that works for engineering roles works just as well
              across the rest of the org chart.
            </p>
          </Reveal>
          <Reveal
            stagger
            className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-3"
          >
            {DOMAINS.map((d) => (
              <span
                key={d.label}
                className="clay-card inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-text)]"
              >
                <span className="material-symbols-outlined text-[18px] text-[var(--color-accent)]">
                  {d.icon}
                </span>
                {d.label}
              </span>
            ))}
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="w-full px-6 md:px-16 py-20 bg-[var(--color-surface)]">
          <Reveal className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-text)] mb-3">
              Questions, answered plainly
            </h2>
          </Reveal>
          <Reveal stagger className="max-w-2xl mx-auto space-y-3">
            {FAQS.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </Reveal>
        </section>

        {/* CTA banner */}
        <Reveal as="section" className="w-full px-6 md:px-16 py-20">
          <div className="max-w-6xl mx-auto rounded-[32px] bg-[var(--color-accent)] p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 blur-3xl" />
            <div className="relative z-10">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-accent-contrast)] mb-4">
                Ready to try it on your own JD?
              </h2>
              <p className="text-[var(--color-accent-contrast)]/80 mb-8 max-w-lg mx-auto">
                No signup required to see it work — create an account when you're ready to save
                results and screen more than a few resumes at a time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/demo"
                  className="bg-[var(--color-surface)] text-[var(--color-accent)] px-8 py-3.5 rounded-full font-heading font-medium text-sm shadow-xl hover:opacity-90 transition"
                >
                  Continue as Guest
                </a>
                <a
                  href="/login"
                  className="border-2 border-white/30 text-[var(--color-accent-contrast)] px-8 py-3.5 rounded-full font-heading font-medium text-sm hover:bg-white/10 transition"
                >
                  Sign In / Sign Up
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </main>

      <footer className="w-full bg-[var(--color-surface-alt)] py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size={24} className="rounded-[8px]" />
            <span className="font-heading text-sm font-semibold text-[var(--color-text)]">
              ResumeMatch
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <a href="https://startupfa.me/s/resumematch?utm_source=resumematch.co.in" target="_blank" rel="noopener noreferrer" aria-label="ResumeMatch featured on Startup Fame">
              <img src="https://startupfa.me/badges/featured-badge.webp" alt="ResumeMatch - Featured on Startup Fame" width="171" height="54" loading="lazy" />
            </a>
            <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
              <a href="/blog" className="hover:text-[var(--color-text)] transition">Blog</a>
              <a href="/privacy" className="hover:text-[var(--color-text)] transition">Privacy Policy</a>
              <a href="/terms" className="hover:text-[var(--color-text)] transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ValueCard({ icon, iconColor, title, desc }) {
  return (
    <div className="clay-card value-card p-8 relative overflow-hidden">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: `color-mix(in srgb, ${iconColor} 12%, transparent)` }}
      >
        <span className="material-symbols-outlined text-[26px]" style={{ color: iconColor }}>
          {icon}
        </span>
      </div>
      <h3 className="font-heading text-base font-semibold text-[var(--color-text)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a, open, onToggle }) {
  const panelRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (panelRef.current) {
      setHeight(open ? panelRef.current.scrollHeight : 0);
    }
  }, [open]);

  return (
    <div className="clay-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-heading text-sm font-semibold text-[var(--color-text)]">{q}</span>
        <span
          className="material-symbols-outlined text-[var(--color-accent)] flex-shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms var(--ease-out)" }}
        >
          expand_more
        </span>
      </button>
      <div ref={panelRef} className="accordion-panel" style={{ height, opacity: open ? 1 : 0 }}>
        <p className="px-6 pb-5 text-sm text-[var(--color-text-muted)] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

function PreviewRow({ initials, name, meta, highlight, faded }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition ${
        highlight
          ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] shadow-md"
          : `bg-[var(--color-surface-alt)] ${faded ? "opacity-60" : ""}`
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-heading font-bold flex-shrink-0 ${
          highlight ? "bg-white/20" : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        }`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${highlight ? "" : "text-[var(--color-text)]"}`}>
          {name}
        </div>
        <div className={`text-xs ${highlight ? "opacity-80" : "text-[var(--color-text-muted)]"}`}>
          {meta}
        </div>
      </div>
    </div>
  );
}
