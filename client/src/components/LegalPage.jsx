import { useEffect } from "react";
import { getTheme, applyStoredTheme } from "../theme";
import { useSEO } from "../lib/seo";
import Logo from "./Logo";

const CONTACT_EMAIL = "aryanarora230506@gmail.com";
const EFFECTIVE_DATE = "August 6, 2026";

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
          contain candidate names, contact details, and work history). We also log basic technical
          data through our hosting and error-monitoring providers — IP address, browser type, and
          request timestamps — for security and debugging.
        </p>
        <p>
          The free public demo does not create an account and does not save anything — analyses
          there exist only in your browser session and are discarded when you close the tab.
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
      <Section title="Legal basis for processing">
        <p>
          We process account and job data to perform the contract you enter into by creating an
          account (i.e., to run the service you signed up for). We process candidate resume data
          on your organization's instructions, as your data processor — you (the recruiter or
          hiring team) are the data controller for candidate data you upload, and you're
          responsible for having a lawful basis to collect and share it with us.
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
          Each of these processes data on our behalf under its own security and privacy terms; we
          don't sell or share your data with advertisers, data brokers, or anyone outside this
          list.
        </p>
      </Section>
      <Section title="Where your data is processed">
        <p>
          Our infrastructure runs across multiple regions (including Tokyo and Seoul), so data may
          be processed or stored outside your own country. Each provider we use maintains its own
          security certifications for cross-border data handling.
        </p>
      </Section>
      <Section title="Security">
        <p>
          All traffic to ResumeMatch is encrypted in transit (HTTPS/TLS). Authentication and
          password storage are handled by Supabase Auth, which salts and hashes credentials — we
          never see or store your password in plain text. Access to production data is limited to
          the people operating the service.
        </p>
      </Section>
      <Section title="Data retention & deletion">
        <p>
          Candidate resumes and job data are kept for as long as your organization's account is
          active. You can delete individual candidates or jobs from within the app at any time. If
          you request deletion of your organization's account, we remove your data from active
          systems within 30 days; residual copies may persist briefly in encrypted backups until
          they age out on our normal backup rotation.
        </p>
      </Section>
      <Section title="Cookies & sessions">
        <p>
          We use only the session cookies/local storage needed to keep you signed in (managed by
          Supabase Auth) and to remember your light/dark theme preference. We don't use advertising
          or tracking cookies, and we don't run third-party analytics trackers that build a
          cross-site profile of you.
        </p>
      </Section>
      <Section title="Candidates whose resumes are uploaded">
        <p>
          If you're a candidate and a recruiter has uploaded your resume to ResumeMatch, we
          process it on that organization's behalf. To access, correct, or request deletion of
          your data, contact the organization that uploaded it directly — or email us and we'll
          route the request to them.
        </p>
      </Section>
      <Section title="Your rights">
        <p>
          Depending on where you're located, you may have the right to access, correct, export, or
          delete the personal data we hold about you, and to object to certain processing. To
          exercise any of these, email us below — we aim to respond within 30 days.
        </p>
      </Section>
      <Section title="Children's privacy">
        <p>
          ResumeMatch is a business tool intended for use by adults acting on behalf of an
          employer or recruiting organization. It isn't directed at, and we don't knowingly collect
          data from, children.
        </p>
      </Section>
      <Section title="Changes to this policy">
        <p>
          If we make a material change to how we handle your data, we'll update the effective date
          on this page and, where required, notify account holders by email.
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
      <Section title="Eligibility">
        <p>
          You must be at least 18 years old and able to form a binding contract to use
          ResumeMatch. If you're using it on behalf of an organization, you're confirming you have
          the authority to accept these terms for that organization.
        </p>
      </Section>
      <Section title="Your account">
        <p>
          You're responsible for the accuracy of the information you provide and for keeping your
          account credentials secure. You must have the right to upload any resume or candidate
          data you submit to the service, and you're responsible for complying with employment and
          data protection law that applies to your own hiring process.
        </p>
      </Section>
      <Section title="Acceptable use">
        <p>
          You agree not to use ResumeMatch to discriminate against candidates on any basis
          prohibited by applicable employment law, to upload data you don't have rights to, to
          upload malware or attempt to disrupt the service, or to reverse-engineer, scrape, or
          resell access to the service without our written permission.
        </p>
      </Section>
      <Section title="Free demo">
        <p>
          The public demo (no account required) is provided as-is for evaluation purposes.
          Nothing submitted there is saved, and results are not guaranteed to reflect the accuracy
          of the full product.
        </p>
      </Section>
      <Section title="Fees">
        <p>
          ResumeMatch is currently free to use while the product is in early access. If we
          introduce paid plans, pricing and billing terms will be presented before any charge, and
          continued use of a paid plan after that point constitutes acceptance of those terms.
        </p>
      </Section>
      <Section title="Ownership">
        <p>
          We own the ResumeMatch software, branding, and underlying technology. You own the job
          descriptions and candidate data you upload; you grant us only the limited right to
          process it in order to provide the service to you, as described in our{" "}
          <a href="/privacy" className="text-[var(--color-accent)] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </Section>
      <Section title="Availability & liability">
        <p>
          ResumeMatch is provided "as is," without warranties of any kind. We work to keep the
          service available and your data safe, but we don't guarantee uninterrupted uptime and
          aren't liable for indirect or consequential damages arising from use of the service, to
          the maximum extent permitted by law. You agree to indemnify us against claims arising
          from candidate data you upload without the right to do so, or from your use of the
          service in violation of applicable employment law.
        </p>
      </Section>
      <Section title="Termination">
        <p>
          You may stop using the service and request deletion of your account at any time. We may
          suspend or terminate accounts that violate these terms, with notice where practical.
        </p>
      </Section>
      <Section title="Governing law">
        <p>These terms are governed by the laws of India, without regard to conflict-of-law rules.</p>
      </Section>
      <Section title="Changes">
        <p>
          We may update these terms as the product evolves. Material changes will be reflected by
          updating the effective date on this page, and where required, we'll notify account
          holders by email.
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
  const isPrivacy = page === "privacy";

  useSEO({
    title: isPrivacy ? "Privacy Policy" : "Terms of Service",
    description: isPrivacy
      ? "How ResumeMatch collects, uses, and protects your account and candidate data."
      : "The terms governing your use of ResumeMatch.",
    path: isPrivacy ? "/privacy" : "/terms",
  });

  useEffect(() => {
    applyStoredTheme();
  }, []);

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
