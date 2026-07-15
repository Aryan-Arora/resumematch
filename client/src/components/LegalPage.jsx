import { useEffect } from "react";
import { getTheme, applyStoredTheme } from "../theme";
import Logo from "./Logo";

const CONTACT_EMAIL = "aryanarora230506@gmail.com";
const EFFECTIVE_DATE = "July 15, 2026";

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="font-heading text-base font-semibold text-[var(--color-text)] mb-2">
        {title}
      </h2>
      <div className="text-sm text-[var(--color-text-muted)] leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

function PrivacyContent() {
  return (
    <>
      <Section title="What we collect">
        <p>
          When you use ResumeMatch we collect: your account email, your organization name, the job
          descriptions you paste or upload, and the resumes you upload for screening (which may
          contain candidate names, contact details, and work history). The free public demo does
          not create an account and does not save anything — analyses there exist only in your
          browser session.
        </p>
      </Section>
      <Section title="How we use it">
        <p>
          Resume and job description content is used solely to run the matching engine and show
          you results. Matching runs on local embeddings on our own servers — resume content is
          not sent to a third-party AI API for scoring. We do not sell your data or candidates'
          data, and we do not use it to train models beyond your own account's results.
        </p>
      </Section>
      <Section title="Who we share it with">
        <p>We use a small number of infrastructure providers to run the service:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Supabase — database, authentication, and file storage</li>
          <li>Fly.io — application hosting</li>
          <li>Resend — transactional email (account verification, password reset, shortlist notifications)</li>
          <li>Sentry — error monitoring (technical error data only, not resume content)</li>
        </ul>
        <p>
          These providers process data on our behalf under their own security and privacy
          commitments. We do not share your data with anyone else, including advertisers.
        </p>
      </Section>
      <Section title="Data retention & deletion">
        <p>
          Candidate resumes and job data are kept for as long as your organization's account is
          active. You can delete individual candidates or jobs from within the app, or request
          full deletion of your organization's data at any time by emailing us below.
        </p>
      </Section>
      <Section title="Cookies & sessions">
        <p>
          We use only the session cookies/local storage needed to keep you signed in (managed by
          Supabase Auth). We don't use advertising or tracking cookies.
        </p>
      </Section>
      <Section title="Your rights">
        <p>
          You can request a copy of the data we hold about you or your organization, or request
          its deletion, by contacting us. We'll respond within a reasonable timeframe.
        </p>
      </Section>
      <Section title="Contact">
        <p>
          Questions about this policy or a data request? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-accent)] hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <Section title="The service">
        <p>
          ResumeMatch is a resume-screening tool that matches job descriptions against uploaded
          resumes and surfaces matched, missing, and implied skills. It's provided to help
          recruiters and hiring teams organize and prioritize candidates — it does not make hiring
          decisions and its output should be reviewed by a human before any employment decision is
          made.
        </p>
      </Section>
      <Section title="Your account">
        <p>
          You're responsible for the accuracy of the information you provide and for keeping your
          account credentials secure. You must have the right to upload any resume or candidate
          data you submit to the service.
        </p>
      </Section>
      <Section title="Acceptable use">
        <p>
          You agree not to use ResumeMatch to discriminate against candidates on any basis
          prohibited by applicable employment law, to upload data you don't have rights to, or to
          attempt to disrupt, reverse-engineer, or abuse the service.
        </p>
      </Section>
      <Section title="Free demo">
        <p>
          The public demo (no account required) is provided as-is for evaluation purposes.
          Nothing submitted there is saved, and results are not guaranteed to reflect the accuracy
          of the full product.
        </p>
      </Section>
      <Section title="Availability & liability">
        <p>
          ResumeMatch is provided "as is," without warranties of any kind. We work to keep the
          service available and your data safe, but we don't guarantee uninterrupted uptime and
          aren't liable for indirect or consequential damages arising from use of the service, to
          the maximum extent permitted by law.
        </p>
      </Section>
      <Section title="Termination">
        <p>
          You may stop using the service and request deletion of your account at any time. We may
          suspend or terminate accounts that violate these terms.
        </p>
      </Section>
      <Section title="Changes">
        <p>
          We may update these terms as the product evolves. Material changes will be reflected by
          updating the effective date on this page.
        </p>
      </Section>
      <Section title="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-accent)] hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </>
  );
}

export default function LegalPage({ page }) {
  useEffect(() => {
    applyStoredTheme();
  }, []);

  const isPrivacy = page === "privacy";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="inline-flex items-center gap-2.5 mb-8">
          <Logo size={32} className="rounded-[10px]" />
          <span className="font-heading text-lg font-bold text-[var(--color-text)]">
            ResumeMatch
          </span>
        </a>

        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-1">
          {isPrivacy ? "Privacy Policy" : "Terms of Service"}
        </h1>
        <p className="text-xs text-[var(--color-text-faint)] mb-8">
          Effective {EFFECTIVE_DATE}
        </p>

        {isPrivacy ? <PrivacyContent /> : <TermsContent />}

        <div className="mt-10 pt-6 border-t border-[var(--color-border)]/60 flex items-center gap-4 text-sm">
          <a href="/privacy" className="text-[var(--color-accent)] hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="text-[var(--color-accent)] hover:underline">
            Terms of Service
          </a>
          <a href="/" className="text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]">
            ← Back home
          </a>
        </div>
      </div>
    </div>
  );
}
