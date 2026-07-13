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

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[var(--color-surface)] border-r border-[var(--color-border)]/60 flex flex-col py-6 z-50 transition-colors">
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
        <button
          onClick={handleToggle}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)] transition flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-heading text-sm transition-colors ${
                active
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold border-r-4 border-[var(--color-accent)]"
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
          onClick={() => onNavigate("upload")}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-heading text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition"
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
  );
}
