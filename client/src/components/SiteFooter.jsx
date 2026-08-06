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
    </footer>
  );
}
