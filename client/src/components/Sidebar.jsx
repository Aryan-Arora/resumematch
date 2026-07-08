const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "projects", label: "Projects", icon: "folder_shared" },
  { key: "upload", label: "Upload", icon: "cloud_upload" },
  { key: "analytics", label: "Analytics", icon: "analytics" },
];

export default function Sidebar({ current, onNavigate }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-[#c6c6cd]/60 flex flex-col py-6 z-50">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#4648d4] flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <h1 className="font-heading text-lg font-bold text-[#0b1c30]">ResumeMatch</h1>
        </div>
        <p className="text-xs text-[#45464d] mt-1">HR Candidate Screening</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-heading text-sm transition-colors ${
                active
                  ? "bg-[#e5eeff] text-[#4648d4] font-bold border-r-4 border-[#4648d4]"
                  : "text-[#45464d] hover:bg-[#eff4ff]"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-3">
        <button
          onClick={() => onNavigate("upload")}
          className="w-full flex items-center justify-center gap-2 bg-[#4648d4] text-white font-heading text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Project
        </button>
      </div>
    </aside>
  );
}
