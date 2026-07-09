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
    return <div className="min-h-screen bg-[#f8f9ff]" />;
  }

  if (status === "locked") {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center px-8">
        <div className="bg-white border border-[#c6c6cd]/60 rounded-xl shadow-sm p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded bg-[#4648d4] flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="font-heading font-bold text-[#0b1c30]">ResumeMatch</span>
          </div>
          <p className="text-[#45464d] text-sm mb-6">Enter the access password to continue.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#eff4ff] border border-[#c6c6cd]/70 rounded-lg px-3.5 py-2.5 text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent transition"
            />
            {error && <p className="text-[#ba1a1a] text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black hover:bg-[#1a1a1a] text-white font-heading font-medium text-sm px-4 py-2.5 rounded-lg transition"
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
