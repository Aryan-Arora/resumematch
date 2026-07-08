import { useState } from "react";
import { uploadCandidates } from "../api";

function fileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") {
    return (
      <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-[#c6c6cd]/70 text-[#ba1a1a]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.5L14.5 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-[#c6c6cd]/70 text-[#4648d4]">
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
      await uploadCandidates(job.id, files);
      onUploaded();
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-semibold text-[#0b1c30]">Upload Resumes</h1>
        </div>
        <p className="text-[#45464d] text-sm mb-6">
          Bulk upload candidate resumes for <span className="font-medium text-[#0b1c30]">{job.title}</span>.
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
            dragOver ? "border-[#4648d4] bg-[#eff4ff]" : "border-[#c6c6cd] bg-[#eff4ff]/60 hover:bg-[#eff4ff]"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-[#4648d4]/10 flex items-center justify-center text-[#4648d4]">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <p className="font-heading text-sm font-semibold text-[#0b1c30]">Drop candidate resumes here</p>
          <p className="text-xs text-[#45464d]">PDF or DOCX, or click to browse</p>
          <span className="mt-1 px-5 py-2 border border-[#4648d4] text-[#4648d4] font-heading text-sm font-medium rounded-lg">
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
              <h4 className="font-heading text-sm font-medium text-[#0b1c30]">
                Pending Resumes ({files.length})
              </h4>
              <button
                onClick={() => setFiles([])}
                className="text-xs font-medium text-[#4648d4] hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-[#eff4ff] border border-[#c6c6cd]/60 rounded-lg"
                >
                  {fileIcon(f.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0b1c30] font-medium truncate">{f.name}</p>
                    <p className="text-xs text-[#45464d]">{(f.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#0c9488] bg-[#89f5e7]/40 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#0c9488] rounded-full" />
                    Ready to Process
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-[#ba1a1a] text-sm bg-[#ffdad6]/60 border border-[#ba1a1a]/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className="bg-black hover:bg-[#1a1a1a] text-white font-heading font-medium text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {loading ? "Uploading & Scoring..." : "Upload & Score"}
          </button>
          <button
            onClick={() => onUploaded()}
            className="border border-[#c6c6cd] text-[#0b1c30] font-heading font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-[#eff4ff] transition"
          >
            Skip to Table
          </button>
        </div>
      </div>
    </div>
  );
}
