import { useEffect, useState } from "react";
import { updatePassword } from "../auth";
import { supabase } from "../supabaseClient";
import Logo from "./Logo";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  // undefined = still checking, true = valid recovery session, false = no/expired link
  const [sessionReady, setSessionReady] = useState(undefined);

  useEffect(() => {
    // A valid emailed link makes Supabase set a recovery session automatically
    // from the URL on load. Checking for it upfront means someone who lands
    // here with an expired/missing link sees a clear message immediately,
    // instead of filling out the form and only then hitting a raw
    // "Auth session missing!" error from the SDK.
    supabase.auth.getSession().then(({ data }) => {
      setSessionReady(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setSessionReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
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

        {sessionReady === undefined ? (
          <p className="text-[var(--color-text-muted)] text-sm mt-4">Checking your link...</p>
        ) : sessionReady === false ? (
          <>
            <p className="text-[var(--color-danger)] text-sm mt-4 mb-6">
              This reset link is invalid or has expired. Request a new one from the sign-in screen.
            </p>
            <a
              href="/"
              className="block w-full text-center bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg transition"
            >
              Back to sign in
            </a>
          </>
        ) : done ? (
          <>
            <p className="text-[var(--color-success)] text-sm mt-4 mb-6">
              Password updated. You can sign in with your new password now.
            </p>
            <a
              href="/"
              className="block w-full text-center bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg transition"
            >
              Go to sign in
            </a>
          </>
        ) : (
          <>
            <p className="text-[var(--color-text-muted)] text-sm mb-6">Choose a new password.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                autoFocus
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
              />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
              />
              {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
