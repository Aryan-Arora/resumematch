import { useState } from "react";
import { uploadCandidates } from "../api";

function fileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") {
    return (
      <div className="w-10 h-10 bg-[var(--color-surface)] rounded flex items-center justify-center border border-[var(--color-border)]/70 text-[var(--color-danger)]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.5L14.5 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 bg-[var(--color-surface)] rounded flex items-center justify-center border border-[var(--color-border)]/70 text-[var(--color-accent)]">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
}

export default function BulkUpload({ job, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(fileList) {
    setFiles(Array.from(fileList));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const result = await uploadCandidates(job.id, files);
      if (result.failures && result.failures.length > 0) {
        const summary = result.failures.map((f) => `${f.file_name}: ${f.error}`).join("; ");
        setError(`${result.failures.length} file(s) failed to process — ${summary}`);
        setLoading(false);
        return;
      }
      onUploaded();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)]/60 rounded-xl shadow-sm p-8 transition-colors">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-semibold text-[var(--color-text)]">Upload Resumes</h1>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          Bulk upload candidate resumes for{" "}
          <span className="font-medium text-[var(--color-text)]">{job.title}</span>.
        </p>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition ${
            dragOver
              ? "border-[var(--color-accent)] bg-[var(--color-surface-alt)]"
              : "border-[var(--color-border)] bg-[var(--color-surface-alt)]/60 hover:bg-[var(--color-surface-alt)]"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <p className="font-heading text-sm font-semibold text-[var(--color-text)]">
            Drop candidate resumes here
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            PDF or DOCX, or click to browse — up to 100 files, 10MB each
          </p>
          <span className="mt-1 px-5 py-2 border border-[var(--color-accent)] text-[var(--color-accent)] font-heading text-sm font-medium rounded-lg">
            Browse Files
          </span>
          <input
            type="file"
            accept=".pdf,.docx"
            multiple
            onChange={(e) => addFiles(e.target.files)}
            className="hidden"
          />
        </label>

        {files.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center px-1 mb-2">
              <h4 className="font-heading text-sm font-medium text-[var(--color-text)]">
                Pending Resumes ({files.length})
              </h4>
              <button
                onClick={() => setFiles([])}
                className="text-xs font-medium text-[var(--color-accent)] hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)]/60 rounded-lg"
                >
                  {fileIcon(f.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text)] font-medium truncate">{f.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {(f.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-success)] bg-[var(--color-success-soft)]/40 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[var(--color-success)] rounded-full" />
                    Ready to Process
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-[var(--color-danger)] text-sm bg-[var(--color-danger-soft)]/40 border border-[var(--color-danger)]/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className="bg-[var(--color-cta-bg)] hover:opacity-90 text-[var(--color-cta-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? "Uploading & Scoring..." : "Upload & Score"}
          </button>
          <button
            onClick={() => onUploaded()}
            className="border border-[var(--color-border)] text-[var(--color-text)] font-heading font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-[var(--color-surface-alt)] transition"
          >
            Skip to Table
          </button>
        </div>
      </div>
    </div>
  );
}
