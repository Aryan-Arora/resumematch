import { useEffect, useState } from "react";
import { getTheme, toggleTheme, applyStoredTheme } from "../theme";
import Logo from "./Logo";

export default function SiteHeader() {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    applyStoredTheme();
    setThemeState(getTheme());
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-[var(--color-surface)]/60 backdrop-blur-xl border-b border-[var(--color-border)]/40">
      <div className="h-20 w-full px-6 md:px-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Logo size={32} className="rounded-[10px]" />
          <span className="font-heading text-lg font-bold text-[var(--color-text)]">
            ResumeMatch
          </span>
        </a>
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
  );
}
