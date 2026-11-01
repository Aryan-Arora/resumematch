import { useSEO, useJsonLd } from "../lib/seo";
import { DOMAIN_PAGES, getDomainPage } from "../content/domainPages";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function DomainPage({ slug }) {
  const page = getDomainPage(slug);
  const path = `/resume-screening/${slug}`;
  const description = page
    ? `Explainable resume screening for ${page.roles.slice(0, 3).join(", ").toLowerCase()} and more. See matched, missing and implied skills with evidence. No signup.`
    : "";

  useSEO({
    title: page ? page.title : "Page not found",
    description: page ? description : "This page doesn't exist.",
    path,
  });

  useJsonLd(
    page
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null
  );
  useJsonLd(
    page
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://resumematch.co.in/" },
            { "@type": "ListItem", position: 2, name: page.title, item: `https://resumematch.co.in${path}` },
          ],
        }
      : null
  );

  if (!page) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <SiteHeader />
        <main className="pt-32 pb-24 px-6 md:px-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-4">Page not found</h1>
          <a href="/" className="text-[var(--color-accent)] hover:underline">Back to ResumeMatch</a>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const others = DOMAIN_PAGES.filter((p) => p.slug !== slug);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <SiteHeader />
      <main className="pt-32 pb-24 px-6 md:px-16">
        <section className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold mb-4">
            Resume screening for {page.label}
          </p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text)] text-balance mb-5">
            {page.title}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-text-muted)] mb-4">{page.intro}</p>
          <p className="text-[var(--color-text-muted)] leading-relaxed mb-4">
            Typical roles: {page.roles.join(", ")}.
          </p>
          <p className="text-[var(--color-text-muted)] leading-relaxed mb-8">{page.why}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`/demo?example=${slug}`}
              className="clay-button bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] px-7 py-3.5 rounded-full font-heading font-medium text-sm text-center"
            >
              Try it on a {page.label.toLowerCase()} job description
            </a>
            <a href="/login" className="glass-panel px-7 py-3.5 rounded-full font-heading font-medium text-sm text-[var(--color-text)] text-center">
              Create a free workspace
            </a>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mt-16">
          <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--color-text)] mb-2">
            What ResumeMatch looks for in {page.label.toLowerCase()} roles
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            A sample of the requirements it recognises in a job description and checks for in each resume.
          </p>
          <div className="space-y-5">
            {page.groups.map((g) => (
              <div key={g.label}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)] mb-2">{g.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/60 text-[var(--color-text)]">
                      {s}
                    </span>
                  ))}
                  {g.more > 0 && <span className="text-xs px-2.5 py-1 text-[var(--color-text-faint)]">and {g.more} more</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto mt-16">
          <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--color-text)] mb-3">Example job description</h2>
          <blockquote className="clay-card p-5 text-sm leading-relaxed text-[var(--color-text-muted)]">{page.sampleJd}</blockquote>
          <p className="text-sm text-[var(--color-text-muted)] mt-3">
            Paste this, or your own, into the <a className="text-[var(--color-accent)] hover:underline" href={`/demo?example=${slug}`}>free demo</a> and
            you will see the requirements it extracts and, with a resume attached, which are matched, missing or implied. No signup needed.
          </p>
        </section>

        <section className="max-w-3xl mx-auto mt-16">
          <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--color-text)] mb-4">Questions</h2>
          <div className="space-y-5">
            {page.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-heading font-semibold text-[var(--color-text)] mb-1">{f.q}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-faint)] mt-6">
            ResumeMatch is a prioritisation aid, not an automatic hiring decision. Review the underlying resume and apply consistent human review.
          </p>
        </section>

        <section className="max-w-3xl mx-auto mt-16">
          <h2 className="font-heading text-lg font-bold tracking-tight text-[var(--color-text)] mb-3">Other hiring areas</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((p) => (
              <a key={p.slug} href={`/resume-screening/${p.slug}`} className="text-sm px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition">
                {p.label}
              </a>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
