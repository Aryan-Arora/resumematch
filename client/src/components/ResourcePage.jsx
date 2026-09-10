import { useSEO, useJsonLd } from "../lib/seo";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const RESUME_PARSER = {
  title: "Free Resume Parser and Explainable Screening Tool",
  description: "Parse PDF and DOCX resumes, extract job-relevant skills, and compare candidates against a job description with explainable evidence.",
};

export default function ResourcePage({ type = "parser" }) {
  const parser = type === "parser";
  const meta = parser ? RESUME_PARSER : {
    title: "ResumeMatch Documentation",
    description: "Product documentation for ResumeMatch resume parsing, explainable matching, supported files, privacy, and screening workflows.",
  };

  useSEO({ title: meta.title, description: meta.description, path: parser ? "/resume-parser" : "/docs" });
  useJsonLd({
    "@context": "https://schema.org",
    "@type": parser ? "SoftwareApplication" : "TechArticle",
    name: parser ? "ResumeMatch Resume Parser" : "ResumeMatch Documentation",
    headline: meta.title,
    description: meta.description,
    url: `https://resumematch.co.in${parser ? "/resume-parser" : "/docs"}`,
    applicationCategory: parser ? "BusinessApplication" : undefined,
  });

  return <div className="min-h-screen bg-[var(--color-bg)]"><SiteHeader /><main className="pt-32 pb-24 px-6 md:px-16">
    <article className="max-w-4xl mx-auto">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] font-semibold mb-5">{parser ? "Free resume parser" : "Product documentation"}</p>
      <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-text)] text-balance mb-6">{meta.title}</h1>
      <p className="max-w-3xl text-lg leading-relaxed text-[var(--color-text-muted)] mb-9">{meta.description}</p>
      <div className="flex flex-wrap gap-3 mb-16">
        <a href="/demo" className="clay-button bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] px-7 py-3.5 rounded-full font-heading font-medium text-sm">Try the free demo</a>
        <a href="/blog/resume-screening-scorecard-template" className="glass-panel px-7 py-3.5 rounded-full font-heading font-medium text-sm text-[var(--color-text)]">Use the scorecard template</a>
      </div>
      <div className="grid md:grid-cols-2 gap-5 mb-14">
        {(parser ? [
          ["Supported files", "Upload PDF and DOCX resumes for screening."],
          ["What it extracts", "Job-relevant skills, experience signals, and requirements."],
          ["Explainable output", "Matched, missing, and implied skills with resume evidence."],
          ["Privacy boundary", "The free demo is not saved; review the privacy policy before using candidate data."],
        ] : [
          ["Workflow", "Paste a job description, upload resumes, and review a ranked shortlist."],
          ["Matching", "Local embeddings and skill signals compare each requirement with resume content."],
          ["Review", "Inspect evidence, adjust priorities, and keep the final decision with a person."],
          ["Formats", "PDF and DOCX are supported in the public demo and workspace workflow."],
        ]).map(([heading, body]) => <section key={heading} className="clay-card p-6"><h2 className="font-heading font-semibold text-[var(--color-text)] mb-2">{heading}</h2><p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{body}</p></section>)}
      </div>
      <div className="space-y-10 text-[var(--color-text-muted)] leading-relaxed">
        <section><h2 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-3">How ResumeMatch works</h2><p>ResumeMatch starts with the job description as the source of truth. It extracts requirements, compares them with each resume, and keeps the reasoning visible instead of collapsing the review into an unexplained score. Semantic similarity helps find equivalent language, while skill and evidence signals help a recruiter inspect the result.</p></section>
        <section><h2 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-3">What the result means</h2><p><strong>Matched</strong> skills are supported directly by the resume. <strong>Missing</strong> skills are requirements without supporting resume evidence. <strong>Implied</strong> skills are reasonable inferences from stated experience and should be verified by a human reviewer.</p></section>
        <section><h2 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-3">Limitations and responsible use</h2><p>A screening result is a prioritization aid, not an automatic hiring decision. Resume formatting, scanned documents, ambiguous requirements, and incomplete candidate information can affect results. Review the underlying resume and apply the same criteria consistently to every candidate.</p></section>
        {!parser && <section><h2 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-3">More resources</h2><div className="flex flex-wrap gap-3"><a className="text-[var(--color-accent)] hover:underline" href="/resume-parser">Resume parser overview →</a><a className="text-[var(--color-accent)] hover:underline" href="/blog">Screening blog →</a><a className="text-[var(--color-accent)] hover:underline" href="/privacy">Privacy policy →</a></div></section>}
      </div>
    </article>
  </main><SiteFooter /></div>;
}
