import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-[var(--color-surface-alt)] py-12 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <a href="/" className="flex items-center gap-2">
          <Logo size={24} className="rounded-[8px]" />
          <span className="font-heading text-sm font-semibold text-[var(--color-text)]">
            ResumeMatch
          </span>
        </a>
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <a
            href="https://startupfa.me/s/resumematch?utm_source=resumematch.co.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ResumeMatch featured on Startup Fame"
          >
            <img
              src="https://startupfa.me/badges/featured-badge.webp"
              alt="ResumeMatch - Featured on Startup Fame"
              width="171"
              height="54"
              loading="lazy"
            />
          </a>
          <a href="https://openhunts.com" target="_blank" title="OpenHunts Club">
            <img alt="OpenHunts Club Member" height="105" src="https://cdn.openhunts.com/badges/club.webp" style={{ width: "195px", height: "auto" }} width="486" loading="lazy" />
          </a>
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
          <a href="/blog" className="hover:text-[var(--color-text)] transition">
            Blog
          </a>
          <a href="/privacy" className="hover:text-[var(--color-text)] transition">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-[var(--color-text)] transition">
            Terms of Service
          </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
