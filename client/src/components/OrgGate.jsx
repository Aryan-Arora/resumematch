import { useEffect, useState } from "react";
import { getMyOrganization, createOrganization, joinOrganization } from "../api";
import { signOut } from "../auth";
import Logo from "./Logo";

export default function OrgGate({ children }) {
  const [organization, setOrganization] = useState(undefined); // undefined = loading
  const [mode, setMode] = useState("join"); // "join" | "create"
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdOrg, setCreatedOrg] = useState(null);

  useEffect(() => {
    getMyOrganization()
      .then((data) => setOrganization(data.organization))
      .catch((err) => setError(err.message));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { organization: org } = await createOrganization(name);
      setCreatedOrg(org);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { organization: org } = await joinOrganization(code);
      setOrganization(org);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (organization === undefined) {
    return <div className="min-h-screen bg-[var(--color-bg)]" />;
  }

  if (organization) {
    return children;
  }

  if (createdOrg) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-8 w-full max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo size={32} className="rounded-[12px]" />
            <span className="font-heading font-bold text-[var(--color-text)]">ResumeMatch</span>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            "{createdOrg.name}" is ready. Share this code with teammates so they can join —
            anyone with the code sees the same jobs and candidates as you.
          </p>
          <div className="font-heading text-2xl font-bold tracking-widest text-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-lg py-4 mb-6">
            {createdOrg.join_code}
          </div>
          <button
            onClick={() => setOrganization(createdOrg)}
            className="w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg transition"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-8">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <Logo size={32} className="rounded-[12px]" />
          <span className="font-heading font-bold text-[var(--color-text)]">ResumeMatch</span>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          Join your team's organization with a code, or start a new one.
        </p>

        <div className="flex bg-[var(--color-surface-alt)] rounded-lg p-1 mb-4">
          <button
            onClick={() => {
              setMode("join");
              setError(null);
            }}
            className={`flex-1 text-sm font-heading font-medium py-1.5 rounded-md transition ${
              mode === "join"
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Join with code
          </button>
          <button
            onClick={() => {
              setMode("create");
              setError(null);
            }}
            className={`flex-1 text-sm font-heading font-medium py-1.5 rounded-md transition ${
              mode === "create"
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Create new
          </button>
        </div>

        {mode === "join" ? (
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Organization code"
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
            />
            {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Joining..." : "Join organization"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization name"
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)]/70 rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition"
            />
            {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Creating..." : "Create organization"}
            </button>
          </form>
        )}

        <button
          onClick={() => signOut()}
          className="w-full text-center text-xs text-[var(--color-text-faint)] hover:text-[var(--color-danger)] transition mt-4"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
