import { useEffect, useState } from "react";
import { checkAuth, getStoredApiKey, setStoredApiKey } from "../api";

export default function AuthGate({ children }) {
  const [status, setStatus] = useState("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function verify(key) {
    try {
      const res = await checkAuth(key);
      if (res.ok) {
        setStoredApiKey(key);
        setStatus("authorized");
        return true;
      }
      return false;
    } catch {
      // Backend unreachable — don't block the user behind a password screen for a network error.
      setStatus("authorized");
      return true;
    }
  }

  useEffect(() => {
    verify(getStoredApiKey()).then((ok) => {
      if (!ok) setStatus("locked");
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const ok = await verify(password);
    if (!ok) setError("Incorrect password.");
  }

  if (status === "checking") {
    return <div className="min-h-screen bg-[var(--color-bg)]" />;
  }

  if (status === "locked") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent-contrast)] font-bold text-sm">
              R
            </div>
            <span className="font-heading font-bold text-[var(--color-text)]">ResumeMatch</span>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">
            Enter the access password to continue.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
            />
            {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg transition"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}
