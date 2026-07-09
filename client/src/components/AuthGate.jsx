import { useState } from "react";
import { useSession } from "../auth";
import { supabase } from "../supabaseClient";
import Logo from "./Logo";

export default function AuthGate({ children }) {
  const session = useSession();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  if (session === undefined) {
    return <div className="min-h-screen bg-[var(--color-bg)]" />;
  }

  if (session) {
    return children;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setInfo("Account created — check your email to confirm before logging in.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const companyDomain = email.includes("@") ? email.split("@")[1] : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-8">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <Logo size={32} className="rounded-[12px]" />
          <span className="font-heading font-bold text-[var(--color-text)]">ResumeMatch</span>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          {mode === "login"
            ? "Sign in with your work email."
            : "Create an account with your work email."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
          />
          {companyDomain && (
            <p className="text-xs text-[var(--color-text-faint)]">
              Workspace: <span className="text-[var(--color-text-muted)]">{companyDomain}</span> —
              you'll only see projects from colleagues sharing this email domain.
            </p>
          )}
          {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
          {info && <p className="text-[var(--color-success)] text-sm">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
          className="w-full text-center text-xs text-[var(--color-accent)] hover:underline mt-4"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
