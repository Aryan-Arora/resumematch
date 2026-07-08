import { useState } from "react";
import { createJob } from "../api";

export default function JDForm({ onJobCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const job = await createJob(title, description);
      onJobCreated(job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="bg-white border border-[#c6c6cd]/60 rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-[#4648d4]/10 flex items-center justify-center text-[#4648d4]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-semibold text-[#0b1c30]">New Job</h1>
        </div>
        <p className="text-[#45464d] text-sm mb-6">
          Paste the job description to start screening candidates.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-heading text-sm font-medium text-[#45464d] mb-1.5">
              Job Title
            </label>
            <input
              className="w-full bg-[#eff4ff] border border-[#c6c6cd]/70 rounded-lg px-3.5 py-2.5 text-sm text-[#0b1c30] placeholder:text-[#8a8b93] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              required
            />
          </div>
          <div>
            <label className="block font-heading text-sm font-medium text-[#45464d] mb-1.5">
              Job Description
            </label>
            <textarea
              className="w-full bg-[#eff4ff] border border-[#c6c6cd]/70 rounded-lg px-3.5 py-2.5 text-sm text-[#0b1c30] placeholder:text-[#8a8b93] h-56 focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent transition resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              required
            />
          </div>
          {error && (
            <p className="text-[#ba1a1a] text-sm bg-[#ffdad6]/60 border border-[#ba1a1a]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-[#1a1a1a] text-white font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Continue to Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
