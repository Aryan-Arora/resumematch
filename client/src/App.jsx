import { useState } from "react";
import Sidebar from "./components/Sidebar";
import JDForm from "./components/JDForm";
import BulkUpload from "./components/BulkUpload";
import CandidateTable from "./components/CandidateTable";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import StarredCandidates from "./pages/StarredCandidates";

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
        {view === "dashboard" && <Dashboard onOpenJob={openJob} onNavigate={navigate} />}
        {view === "projects" && <Projects onOpenJob={openJob} onNavigate={navigate} />}
        {view === "analytics" && <Analytics />}
        {view === "starred" && <StarredCandidates />}
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
      </main>
    </div>
  );
}
