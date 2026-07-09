import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart2, Clock, TrendingUp, Zap, AlertCircle,
  ChevronRight, Activity, Building2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "paused";
  sprint: string;
  color: string;
  icon: React.ReactNode;
}

// ── Sabit projeler ─────────────────────────────────────────────────────────────
const STATIC_PROJECTS: Project[] = [];

// Dinamik renk paleti — yeni org'lar için sırayla kullanılır
const DYNAMIC_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#a855f7"];

// localStorage'dan dinamik org'ları okuyup Project dizisine dönüştür
const getDynamicProjects = (): Project[] => {
  try {
    const stored = JSON.parse(localStorage.getItem("orgProjects") || "{}");
    return Object.entries(stored).map(([id, meta]: [string, any], index) => ({
      id,
      name: meta.name,
      description: `${meta.name} çalışma alanı — organizasyona ait proje raporları.`,
      status: "active" as const,
      sprint: meta.sprint || "Sprint 1",
      color: DYNAMIC_COLORS[index % DYNAMIC_COLORS.length],
      icon: <Building2 size={20} />,
    }));
  } catch {
    return [];
  }
};

const STATUS_CONFIG = {
  active:    { label: "Aktif",        dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  paused:    { label: "Duraklatıldı", dot: "bg-amber-400",   text: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-900/30" },
  completed: { label: "Tamamlandı",   dot: "bg-slate-400",   text: "text-slate-500 dark:text-slate-400",    bg: "bg-slate-100 dark:bg-slate-700" },
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ReportsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Sayfa açıldığında ve teams-updated eventi geldiğinde projeleri yenile
    const loadProjects = () => {
      const dynamic = getDynamicProjects();
      setProjects([...STATIC_PROJECTS, ...dynamic]);
    };

    loadProjects();

    window.addEventListener("teams-updated", loadProjects);
    return () => window.removeEventListener("teams-updated", loadProjects);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Raporlar</span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{projects.length} proje</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">Proje Raporları</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Detaylı raporu görüntülemek için bir projeye tıklayın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const sc = STATUS_CONFIG[project.status];
            return (
              <button
                key={project.id}
                onClick={() => navigate(`/reports/${project.id}`)}
                className="group text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 overflow-hidden"
              >
                <div className="h-1.5 w-full" style={{ background: project.color }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: project.color }}
                      >
                        {project.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-tight">
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{project.sprint}</div>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0"
                    />
                  </div>

                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}