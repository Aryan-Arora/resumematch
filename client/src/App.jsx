import { lazy, Suspense, useState } from "react";
import Sidebar from "./components/Sidebar";
const JDForm = lazy(() => import("./components/JDForm"));
const BulkUpload = lazy(() => import("./components/BulkUpload"));
const CandidateTable = lazy(() => import("./components/CandidateTable"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const Analytics = lazy(() => import("./pages/Analytics"));
const StarredCandidates = lazy(() => import("./pages/StarredCandidates"));
const PrivacyRequests = lazy(() => import("./pages/PrivacyRequests"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  const [view, setView] = useState("dashboard");
  const [currentJob, setCurrentJob] = useState(null);

  function navigate(key) {
    if (key === "upload") {
      setCurrentJob(null);
      setView("upload-jd");
    } else {
      setView(key);
    }
  }

  function openJob(job) {
    setCurrentJob(job);
    setView("job");
  }

  const sidebarActive = view === "job" || view.startsWith("upload") ? "upload" : view;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <Sidebar current={sidebarActive} onNavigate={navigate} />
      <main className="pt-14 md:pt-0 md:ml-[260px]">
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-[var(--color-text-muted)]">Loading workspace…</div>}>
          {view === "dashboard" && <Dashboard onOpenJob={openJob} onNavigate={navigate} />}
          {view === "projects" && <Projects onOpenJob={openJob} onNavigate={navigate} />}
          {view === "analytics" && <Analytics />}
          {view === "starred" && <StarredCandidates />}
          {view === "privacy-requests" && <PrivacyRequests />}
          {view === "settings" && <Settings />}
          {view === "upload-jd" && (
          <JDForm
            onJobCreated={(job) => {
              setCurrentJob(job);
              setView("upload-bulk");
            }}
          />
          )}
          {view === "upload-bulk" && currentJob && (
          <BulkUpload job={currentJob} onUploaded={() => setView("job")} />
          )}
          {view === "job" && currentJob && (
          <CandidateTable job={currentJob} onAddMore={() => setView("upload-bulk")} />
          )}
        </Suspense>
      </main>
    </div>
  );
}
