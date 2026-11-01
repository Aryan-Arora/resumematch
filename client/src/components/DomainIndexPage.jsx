import { useSEO, useJsonLd } from "../lib/seo";
import { DOMAIN_PAGES } from "../content/domainPages";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function DomainIndexPage() {
  useSEO({
    title: "Resume Screening by Hiring Area: Tech, Trades, Healthcare and More",
    description:
      "Explainable resume screening for 15 hiring areas, from software and sales to skilled trades, healthcare support and legal. Free demo, no signup.",
    path: "/resume-screening",
  });
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Resume screening by hiring area",
    url: "https://resumematch.co.in/resume-screening",
    hasPart: DOMAIN_PAGES.map((p) => ({
      "@type": "WebPage",
      name: p.title,
      url: `https://resumematch.co.in/resume-screening/${p.slug}`,
    })),
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <SiteHeader />
      <main className="pt-32 pb-24 px-6 md:px-16">
        <section className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold mb-4">Hiring areas</p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text)] text-balance mb-5">
            Resume screening for every kind of role, not just tech
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-text-muted)] mb-10">
            ResumeMatch reads your job description, extracts the skills, certifications and tools it requires, and shows which each
            candidate evidences, with the resume sentence behind it. Pick a hiring area to see what it recognises.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {DOMAIN_PAGES.map((p) => (
              <a key={p.slug} href={`/resume-screening/${p.slug}`} className="clay-card p-5 block hover:text-[var(--color-accent)] transition">
                <span className="flex items-center gap-2 font-heading font-semibold text-[var(--color-text)] mb-1">
                  <span className="material-symbols-outlined text-[20px] text-[var(--color-accent)]">{p.icon}</span>
                  {p.label}
                </span>
                <span className="block text-sm text-[var(--color-text-muted)]">{p.roles.slice(0, 3).join(", ")}</span>
              </a>
            ))}
          </div>
          <div className="mt-10">
            <a href="/demo" className="clay-button bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] px-7 py-3.5 rounded-full font-heading font-medium text-sm inline-block">
              Try the free demo
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
