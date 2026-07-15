import { useEffect, useState } from "react";
import { getTheme, toggleTheme } from "../theme";
import { useSession, signOut } from "../auth";
import { getMyOrganization } from "../api";
import Logo from "./Logo";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "projects", label: "Projects", icon: "folder_shared" },
  { key: "upload", label: "Upload", icon: "cloud_upload" },
  { key: "starred", label: "Starred CVs", icon: "star" },
  { key: "analytics", label: "Analytics", icon: "analytics" },
];

export default function Sidebar({ current, onNavigate }) {
  const [theme, setThemeState] = useState("light");
  const [organization, setOrganization] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useSession();

  useEffect(() => {
    setThemeState(getTheme());
    getMyOrganization()
      .then((data) => setOrganization(data.organization))
      .catch(() => {});
  }, []);

  function handleToggle() {
    setThemeState(toggleTheme());
  }

  function handleNavigate(key) {
    onNavigate(key);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile-only top bar: the sidebar itself is off-canvas below md, so
          this is the one thing that stays reachable to open it. */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)]/60 flex items-center justify-between px-4 z-40 transition-colors">
        <div className="flex items-center gap-2">
          <Logo size={28} className="rounded-[10px]" />
          <span className="font-heading text-base font-bold text-[var(--color-text)]">ResumeMatch</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          title="Open menu"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-[var(--color-surface)]/70 backdrop-blur-xl border-r border-[var(--color-border)]/50 rounded-r-3xl shadow-[24px_0_48px_-24px_rgba(0,102,138,0.18)] flex flex-col py-6 z-50 transition-colors transform transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Logo size={32} className="rounded-[12px] flex-shrink-0" />
              <h1 className="font-heading text-lg font-bold text-[var(--color-text)]">ResumeMatch</h1>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">HR Candidate Screening</p>
            {organization && (
              <button
                onClick={() => setShowCode((v) => !v)}
                title="Click to show/hide your organization's join code"
                className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-accent)] transition mt-1 text-left"
              >
                {organization.name}
                {showCode && (
                  <span className="ml-1.5 font-mono tracking-wider text-[var(--color-accent)]">
                    {organization.join_code}
                  </span>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleToggle}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)] transition"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              title="Close menu"
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-heading text-sm transition-colors ${
                  active
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,102,138,0.08)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-3 space-y-2">
          <button
            onClick={() => handleNavigate("upload")}
            className="clay-button w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-heading text-sm font-medium py-3 rounded-2xl hover:opacity-90 transition"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Project
          </button>
          {session?.user?.email && (
            <div className="flex items-center justify-between px-1 pt-1">
              <span
                className="text-xs text-[var(--color-text-faint)] truncate"
                title={session.user.email}
              >
                {session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="text-[var(--color-text-faint)] hover:text-[var(--color-danger)] transition flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
