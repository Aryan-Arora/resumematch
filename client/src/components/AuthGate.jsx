import { useState } from "react";
import { useSession, requestPasswordReset } from "../auth";
import { supabase } from "../supabaseClient";
import Logo from "./Logo";

export default function AuthGate({ children }) {
  const session = useSession();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
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

  function switchMode(nextMode) {
    setMode(nextMode);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "reset") {
        await requestPasswordReset(email);
        setInfo("Check your email for a password reset link.");
      } else if (mode === "signup") {
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-8">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <Logo size={32} className="rounded-[12px]" />
          <span className="font-heading font-bold text-[var(--color-text)]">ResumeMatch</span>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          {mode === "login" && "Sign in with your email."}
          {mode === "signup" && "Create an account with your email."}
          {mode === "reset" && "Enter your email and we'll send you a reset link."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            {mode === "reset" && (
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                Email address
              </label>
            )}
            <input
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
            />
          </div>
          {mode !== "reset" && (
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
            />
          )}
          {mode === "login" && (
            <button
              type="button"
              onClick={() => switchMode("reset")}
              className="block text-xs text-[var(--color-text-faint)] hover:text-[var(--color-accent)] transition"
            >
              Forgot password?
            </button>
          )}
          {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
          {info && <p className="text-[var(--color-success)] text-sm">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </button>
        </form>
        {mode === "reset" ? (
          <div className="border-t border-[var(--color-border)]/60 mt-5 pt-4">
            <button
              onClick={() => switchMode("login")}
              className="w-full flex items-center justify-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back to sign in
            </button>
          </div>
        ) : (
          <button
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="w-full text-center text-xs text-[var(--color-accent)] hover:underline mt-4"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        )}
        <a
          href="/"
          className="block w-full text-center text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] mt-3"
        >
          Not ready to sign up? Try it on your job description first →
        </a>
      </div>
    </div>
  );
}
