import { useSEO, useJsonLd } from "../lib/seo";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const PAGES = {
  "/free-resume-screening-software": {
    title: "Free Resume Screening Software",
    description: "Screen resumes against a job description with explainable matched, missing, and implied skills. Try ResumeMatch free with no signup.",
    eyebrow: "Free resume screening software",
    intro: "Review more resumes without turning every shortlist into a guessing game.",
    body: "ResumeMatch compares each resume with your actual job description, ranks the candidates, and keeps the evidence behind every match visible. Start with the free demo, then create a workspace when you need saved projects and larger batches.",
    points: ["Paste a job description and upload PDF or DOCX resumes", "See matched, missing, and implied skills for every candidate", "Start without an account and upgrade to saved team projects when ready"],
  },
  "/explainable-ai-resume-screening": {
    title: "Explainable AI Resume Screening",
    description: "Understand why a candidate matches a role with explainable AI resume screening, evidence sentences, and visible skill gaps.",
    eyebrow: "Explainable AI resume screening",
    intro: "A match score is useful only when you can inspect the reasoning behind it.",
    body: "ResumeMatch keeps the screening trail visible: semantic similarity, explicit skill matches, implied skills, missing requirements, and the resume evidence that supports each inference. That gives recruiters a shortlist they can question and defend.",
    points: ["Adjust semantic and skill weighting for the role", "Inspect evidence instead of accepting a black-box score", "Use the same workflow across technical and non-technical hiring"],
  },
  "/ats-alternative-for-recruiters": {
    title: "ATS Alternative for Recruiters and Small Teams",
    description: "A focused ATS alternative for recruiters who need fast, explainable resume screening without an enterprise hiring platform.",
    eyebrow: "ATS alternative for recruiters",
    intro: "Keep the screening step focused when a full applicant tracking system is more than you need.",
    body: "ResumeMatch is built for the moment between receiving applications and deciding who deserves a closer look. Create a project, invite teammates with a workspace join code, and move from job description to explainable shortlist in one place.",
    points: ["Share projects with your hiring team", "Screen PDF and DOCX resumes in bulk", "Star candidates and shortlist them from the review table"],
  },
};

export default function SeoLandingPage({ path }) {
  const page = PAGES[path] || PAGES["/free-resume-screening-software"];
  useSEO({ title: page.title, description: page.description, path });
  useJsonLd({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "ResumeMatch", applicationCategory: "BusinessApplication", url: `https://resumematch.co.in${path}`, description: page.description });

  return <div className="min-h-screen bg-[var(--color-bg)]"><SiteHeader /><main className="pt-32 pb-24 px-6 md:px-16">
    <section className="max-w-4xl mx-auto text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold mb-5">{page.eyebrow}</p>
      <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-text)] text-balance mb-6">{page.intro}</h1>
      <p className="max-w-2xl mx-auto text-lg leading-relaxed text-[var(--color-text-muted)] mb-9">{page.body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/demo" className="clay-button bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] px-7 py-3.5 rounded-full font-heading font-medium text-sm">Try the free demo</a>
        <a href="/blog" className="glass-panel px-7 py-3.5 rounded-full font-heading font-medium text-sm text-[var(--color-text)]">Read the screening guide</a>
      </div>
    </section>
    <section className="max-w-4xl mx-auto mt-20 grid md:grid-cols-3 gap-5">
      {page.points.map((point, i) => <div key={point} className="clay-card p-6"><div className="w-9 h-9 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center font-heading font-bold mb-4">{i + 1}</div><p className="text-sm leading-relaxed text-[var(--color-text)]">{point}</p></div>)}
    </section>
  </main><SiteFooter /></div>;
}
