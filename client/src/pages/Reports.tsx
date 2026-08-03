import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar,
  ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  ArrowLeft, TrendingDown, TrendingUp,
  BarChart2, Zap, PieChart as PieIcon, Clock, Moon, Sun, LayoutGrid,
} from "lucide-react";
import { API_BASE } from "../config/api";


interface ApiTask {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  dueDate?: string | null;
  columnId: string;
  assignee?: { name: string; email: string } | null;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  totalTime?: number;
  storyPoints?: number;
  sprintId?: string | null;
}
interface ApiColumn { id: string; title: string; order: number; tasks: ApiTask[] }
interface BoardData { id: string; title: string; columns: ApiColumn[] }

interface SprintTask { id: string; title: string; storyPoints: number; isCompleted: boolean; priority: string }
interface ApiSprint {
  id: string; name: string; goal: string | null;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  startDate: string | null; endDate: string | null; completedAt: string | null;
  tasks: SprintTask[];
  metrics: { totalTasks: number; completedTasks: number; committedPoints: number; completedPoints: number; completionRate: number };
}

function useDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggleDark = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) { document.documentElement.classList.remove("dark"); localStorage.setItem("theme", "light"); }
    else { document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark"); }
    setDark(!isDark);
  };
  return { dark, toggleDark };
}

function KpiCard({ label, value, sub, color = "text-slate-800 dark:text-slate-100" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm transition-colors">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="font-bold text-slate-800 dark:text-slate-100 text-[14px]">{title}</div>
        {subtitle && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">{text}</div>
  );
}

const chartProps = (dark: boolean) => ({
  cartesianGrid: { stroke: dark ? "#334155" : "#f1f5f9" },
  tick: { fill: dark ? "#94a3b8" : "#64748b", fontSize: 12 },
  tooltipStyle: dark ? { backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" } : {},
});

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const PRIORITY_LABELS: Record<string, string> = { HIGH: "↑ Yüksek", MEDIUM: "→ Orta", LOW: "↓ Düşük" };
const PRIORITY_COLORS: Record<string, string> = { HIGH: "text-red-500 font-bold", MEDIUM: "text-amber-500 font-semibold", LOW: "text-emerald-500" };

function daysBetween(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

type TabId = "sprint" | "burndown" | "burnup" | "velocity" | "cycle" | "created" | "dist" | "age";
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "sprint", label: "Sprint", icon: <Zap size={14} /> },
  { id: "burndown", label: "Burndown", icon: <TrendingDown size={14} /> },
  { id: "burnup", label: "Burnup", icon: <TrendingUp size={14} /> },
  { id: "velocity", label: "Velocity", icon: <BarChart2 size={14} /> },
  { id: "cycle", label: "Cycle Time", icon: <Clock size={14} /> },
  { id: "created", label: "Cr. vs Res.", icon: <BarChart2 size={14} /> },
  { id: "dist", label: "Dağılım", icon: <PieIcon size={14} /> },
  { id: "age", label: "Ort. Yaş", icon: <LayoutGrid size={14} /> },
];

export default function Reports() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<TabId>("sprint");
  const { dark, toggleDark } = useDark();

  const [board, setBoard] = useState<BoardData | null>(null);
  const [sprints, setSprints] = useState<ApiSprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [boardRes, sprintRes] = await Promise.all([
        fetch(`${API_BASE}/api/project/${projectId}/board`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/sprints/project/${projectId}`, { headers: authHeaders }),
      ]);
      const boardData = await boardRes.json();
      const sprintData = await sprintRes.json();
      if (!boardRes.ok) throw new Error(boardData.error || "Proje verisi yüklenemedi.");
      if (!sprintRes.ok) throw new Error(sprintData.error || "Sprint verisi yüklenemedi.");
      setBoard(boardData);
      setSprints(sprintData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const allTasks: (ApiTask & { columnTitle: string })[] = useMemo(() => {
    if (!board) return [];
    return board.columns.flatMap((c) => c.tasks.map((t) => ({ ...t, columnTitle: c.title })));
  }, [board]);

  const activeSprint = sprints.find((s) => s.status === "ACTIVE") || null;
  const completedSprints = useMemo(
    () => sprints.filter((s) => s.status === "COMPLETED")
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()),
    [sprints]
  );

  const activeSprintTaskIds = useMemo(() => new Set((activeSprint?.tasks || []).map((t) => t.id)), [activeSprint]);
  const activeSprintTasksFull = useMemo(
    () => allTasks.filter((t) => activeSprintTaskIds.has(t.id)),
    [allTasks, activeSprintTaskIds]
  );

  const activeLabel = TABS.find((t) => t.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/reports")}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
              title="Raporlar listesine dön">
              <ArrowLeft size={16} />
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <button onClick={() => navigate("/reports")} className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Raporlar
            </button>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{board?.title || "Proje"}</span>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              title={dark ? "Açık moda geç" : "Koyu moda geç"}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={() => navigate(`/projects/${projectId}/sprints`)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              🏃 Sprintleri Yönet
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              {activeSprint ? `${activeSprint.name} (Aktif)` : "Aktif sprint yok"}
            </div>
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-1 pb-0">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                }`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6">
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        ) : (
          <>
            {activeTab === "sprint" && (
              <SprintPanel sprint={activeSprint} tasks={activeSprintTasksFull} onManage={() => navigate(`/projects/${projectId}/sprints`)} />
            )}
            {activeTab === "burndown" && <BurndownPanel sprint={activeSprint} tasks={activeSprintTasksFull} dark={dark} />}
            {activeTab === "burnup" && <BurnupPanel sprint={activeSprint} tasks={activeSprintTasksFull} dark={dark} />}
            {activeTab === "velocity" && <VelocityPanel sprints={completedSprints} dark={dark} />}
            {activeTab === "cycle" && <CyclePanel tasks={allTasks} dark={dark} />}
            {activeTab === "created" && <CreatedPanel tasks={allTasks} dark={dark} />}
            {activeTab === "dist" && <DistPanel columns={board?.columns || []} dark={dark} />}
            {activeTab === "age" && <AgePanel tasks={allTasks} dark={dark} />}
          </>
        )}
      </main>
    </div>
  );
}

function SprintPanel({ sprint, tasks, onManage }: {
  sprint: ApiSprint | null; tasks: (ApiTask & { columnTitle: string })[]; onManage: () => void;
}) {
  if (!sprint) {
    return (
      <div className="space-y-5">
        <SectionCard title="Aktif Sprint Yok">
          <EmptyState text='Bu projede şu anda aktif bir sprint yok. "Sprintleri Yönet" ile bir sprint başlatabilirsiniz.' />
        </SectionCard>
      </div>
    );
  }
  const m = sprint.metrics;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Toplam Görev" value={m.totalTasks} sub={sprint.name} />
        <KpiCard label="Tamamlanan" value={m.completedTasks} color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Taahhüt SP" value={m.committedPoints} />
        <KpiCard label="Tamamlanma" value={`%${m.completionRate}`} color="text-blue-600 dark:text-blue-400" />
      </div>
      <SectionCard title={`${sprint.name} — Görev Listesi`} subtitle={sprint.goal || undefined}>
        <div className="flex justify-end mb-3">
          <button onClick={onManage} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            Görevleri Yönet
          </button>
        </div>
        {tasks.length === 0 ? <EmptyState text="Bu sprinte henüz görev eklenmemiş." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  {["Görev", "Durum", "Öncelik", "Atanan", "SP"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{t.title}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        t.isCompleted ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                      }`}>
                        {t.isCompleted ? "✓ Tamamlandı" : `◦ ${t.columnTitle}`}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 text-xs ${PRIORITY_COLORS[t.priority] || ""}`}>{PRIORITY_LABELS[t.priority] || t.priority}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{t.assignee?.name || "—"}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">{t.storyPoints ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function useBurndownSeries(sprint: ApiSprint | null, tasks: ApiTask[]) {
  return useMemo(() => {
    if (!sprint || !sprint.startDate) return null;
    const start = new Date(sprint.startDate); start.setHours(0, 0, 0, 0);
    const end = sprint.endDate ? new Date(sprint.endDate) : new Date();
    end.setHours(0, 0, 0, 0);
    const totalDays = Math.max(1, daysBetween(end, start));
    const committed = sprint.metrics.committedPoints;

    const data = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i);
      const idealRemaining = Math.max(0, Math.round(committed - (committed * i) / totalDays));
      const completedByDay = tasks
        .filter((t) => t.completedAt && new Date(t.completedAt) <= d)
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      data.push({
        day: `G${i + 1}`,
        date: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
        ideal: idealRemaining,
        actual: committed - completedByDay,
        completed: completedByDay,
      });
    }
    return { data, committed };
  }, [sprint, tasks]);
}

function BurndownPanel({ sprint, tasks, dark }: { sprint: ApiSprint | null; tasks: ApiTask[]; dark: boolean }) {
  const cp = chartProps(dark);
  const series = useBurndownSeries(sprint, tasks);

  if (!sprint || !series) {
    return <SectionCard title="Burndown"><EmptyState text="Burndown grafiği için aktif ve başlangıç tarihi girilmiş bir sprint gerekiyor." /></SectionCard>;
  }

  const last = series.data[series.data.length - 1];
  const remaining = last?.actual ?? series.committed;
  const daysLeft = sprint.endDate ? Math.max(0, daysBetween(new Date(sprint.endDate), new Date())) : null;
  const statusLabel = sprint.metrics.completionRate >= 90 ? "🟢 İyi gidiyor"
    : (daysLeft !== null && daysLeft <= 2 && sprint.metrics.completionRate < 70) ? "🔴 Riskli" : "🟡 Devam ediyor";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Toplam SP" value={series.committed} sub={sprint.name} />
        <KpiCard label="Kalan" value={remaining} sub="story point" color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="Tamamlanan" value={series.committed - remaining} sub="story point" color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Sprint Durumu" value={statusLabel} sub={daysLeft !== null ? `${daysLeft} gün kaldı` : "Bitiş tarihi yok"} />
      </div>
      <SectionCard title={`Burndown Chart — ${sprint.name}`} subtitle="Kalan iş vs ideal ilerleme çizgisi (gerçek görev tamamlanma verisiyle)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="date" tick={cp.tick} />
            <YAxis tick={cp.tick} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="actual" name="Gerçekleşen" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="ideal" name="İdeal" stroke={dark ? "#475569" : "#cbd5e1"} strokeWidth={2} strokeDasharray="6 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function BurnupPanel({ sprint, tasks, dark }: { sprint: ApiSprint | null; tasks: ApiTask[]; dark: boolean }) {
  const cp = chartProps(dark);
  const series = useBurndownSeries(sprint, tasks);

  if (!sprint || !series) {
    return <SectionCard title="Burnup"><EmptyState text="Burnup grafiği için aktif ve başlangıç tarihi girilmiş bir sprint gerekiyor." /></SectionCard>;
  }

  const burnupData = series.data.map((d) => ({ ...d, scope: series.committed }));
  const last = burnupData[burnupData.length - 1];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Toplam Hedef" value={series.committed} />
        <KpiCard label="Tamamlanan" value={last?.completed ?? 0} color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="İlerleme" value={`%${sprint.metrics.completionRate}`} color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="Toplam Görev" value={sprint.metrics.totalTasks} />
      </div>
      <SectionCard title={`Burnup Chart — ${sprint.name}`} subtitle="Tamamlanan iş & kapsam çizgisi (gerçek görev tamamlanma verisiyle)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={burnupData}>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="date" tick={cp.tick} />
            <YAxis tick={cp.tick} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="completed" name="Tamamlanan" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="scope" name="Toplam Kapsam" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function VelocityPanel({ sprints, dark }: { sprints: ApiSprint[]; dark: boolean }) {
  const cp = chartProps(dark);
  if (sprints.length === 0) {
    return <SectionCard title="Velocity"><EmptyState text="Henüz tamamlanmış sprint yok. En az bir sprint tamamlandığında velocity burada görünecek." /></SectionCard>;
  }
  const data = [...sprints].reverse().map((s) => ({ sprint: s.name, committed: s.metrics.committedPoints, completed: s.metrics.completedPoints }));
  const completedVals = sprints.map((s) => s.metrics.completedPoints);
  const avg = Math.round(completedVals.reduce((a, b) => a + b, 0) / completedVals.length);
  const max = Math.max(...completedVals);
  const min = Math.min(...completedVals);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Ort. Velocity" value={avg} sub="SP / sprint" color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="En Yüksek" value={max} color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="En Düşük" value={min} color="text-red-500" />
        <KpiCard label="Tamamlanan Sprint" value={sprints.length} />
      </div>
      <SectionCard title={`Velocity Chart — Son ${sprints.length} Sprint`} subtitle="Gerçek geçmiş sprint verisi">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="sprint" tick={cp.tick} />
            <YAxis tick={cp.tick} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
            <Bar dataKey="committed" name="Taahhüt" fill={dark ? "#1d4ed8" : "#93c5fd"} radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Tamamlanan" fill={dark ? "#3b82f6" : "#1d4ed8"} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function CyclePanel({ tasks, dark }: { tasks: ApiTask[]; dark: boolean }) {
  const cp = chartProps(dark);
  const completed = useMemo(() => tasks
    .filter((t) => t.isCompleted && t.completedAt)
    .map((t) => ({ title: t.title, completedAt: t.completedAt!, cycleTime: Math.max(0, daysBetween(new Date(t.completedAt!), new Date(t.createdAt))) }))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 30), [tasks]);

  if (completed.length === 0) {
    return <SectionCard title="Cycle Time"><EmptyState text="Henüz tamamlanmış görev yok, cycle time hesaplanamıyor." /></SectionCard>;
  }

  const times = completed.map((c) => c.cycleTime).sort((a, b) => a - b);
  const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
  const median = times[Math.floor(times.length / 2)];
  const max = times[times.length - 1];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Ort. Cycle Time" value={avg} sub="gün" color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="Medyan" value={median} sub="gün" />
        <KpiCard label="Maksimum" value={max} sub="gün" color="text-red-500" />
        <KpiCard label="Örneklem" value={completed.length} sub="görev" />
      </div>
      <SectionCard title="Cycle Time" subtitle="Her görevin oluşturulmasından tamamlanmasına kadar geçen gerçek süre">
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="index" name="Görev" tick={cp.tick} />
            <YAxis dataKey="cycleTime" name="Gün" tick={cp.tick} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={cp.tooltipStyle} />
            <ReferenceLine y={Number(avg)} stroke="#86efac" strokeDasharray="5 5" label={{ value: "Ort.", fontSize: 11, fill: "#10b981" }} />
            <Scatter data={completed.map((d, i) => ({ ...d, index: i + 1 }))} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function CreatedPanel({ tasks, dark }: { tasks: ApiTask[]; dark: boolean }) {
  const cp = chartProps(dark);
  const data = useMemo(() => {
    const months: { key: string; label: string; created: number; resolved: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("tr-TR", { month: "short" }), created: 0, resolved: 0 });
    }
    const findMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
    };
    tasks.forEach((t) => {
      const cm = findMonth(t.createdAt);
      if (cm) cm.created++;
      if (t.completedAt) {
        const rm = findMonth(t.completedAt);
        if (rm) rm.resolved++;
      }
    });
    return months;
  }, [tasks]);

  const totalCreated = data.reduce((s, m) => s + m.created, 0);
  const totalResolved = data.reduce((s, m) => s + m.resolved, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Oluşturulan (6 ay)" value={totalCreated} />
        <KpiCard label="Çözülen (6 ay)" value={totalResolved} color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Net Değişim" value={totalCreated - totalResolved} color={totalCreated > totalResolved ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"} />
        <KpiCard label="Toplam Görev" value={tasks.length} />
      </div>
      <SectionCard title="Oluşturulan vs Çözülen" subtitle="Son 6 ay, gerçek görev tarihleri">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="label" tick={cp.tick} />
            <YAxis tick={cp.tick} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
            <Bar dataKey="created" name="Oluşturulan" fill={dark ? "#f59e0b" : "#fbbf24"} radius={[4, 4, 0, 0]} />
            <Bar dataKey="resolved" name="Çözülen" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function DistPanel({ columns, dark }: { columns: ApiColumn[]; dark: boolean }) {
  const cp = chartProps(dark);
  const data = columns.map((c) => ({ name: c.title, value: c.tasks.length }));
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return <SectionCard title="Dağılım"><EmptyState text="Bu projede henüz görev yok." /></SectionCard>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Toplam Görev" value={total} />
        {data.slice(0, 3).map((d) => (
          <KpiCard key={d.name} label={d.name} value={d.value} />
        ))}
      </div>
      <SectionCard title="Kolon Bazlı Dağılım" subtitle="Panodaki güncel görev dağılımı">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function AgePanel({ tasks, dark }: { tasks: (ApiTask & { columnTitle: string })[]; dark: boolean }) {
  const cp = chartProps(dark);
  const now = new Date();
  const openTasks = useMemo(() => tasks
    .filter((t) => !t.isCompleted)
    .map((t) => ({ ...t, age: Math.max(0, daysBetween(now, new Date(t.createdAt))) }))
    .sort((a, b) => b.age - a.age), [tasks]);

  const byColumn = useMemo(() => {
    const map = new Map<string, number[]>();
    openTasks.forEach((t) => {
      if (!map.has(t.columnTitle)) map.set(t.columnTitle, []);
      map.get(t.columnTitle)!.push(t.age);
    });
    return Array.from(map.entries()).map(([status, ages]) => ({
      status, avgAge: Math.round((ages.reduce((a, b) => a + b, 0) / ages.length) * 10) / 10,
    }));
  }, [openTasks]);

  if (openTasks.length === 0) {
    return <SectionCard title="Ortalama Yaş"><EmptyState text="Açık (tamamlanmamış) görev yok." /></SectionCard>;
  }

  const avgAge = (openTasks.reduce((s, t) => s + t.age, 0) / openTasks.length).toFixed(1);
  const oldest = openTasks[0]?.age ?? 0;
  const critical = openTasks.filter((t) => t.age > 14).length;
  const oldIssues = openTasks.filter((t) => t.age >= 7);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Ort. Yaş" value={avgAge} sub="gün" color="text-amber-500" />
        <KpiCard label="En Yaşlı" value={oldest} sub="gün" color="text-red-500" />
        <KpiCard label="Kritik (>14g)" value={critical} color="text-red-500" />
        <KpiCard label="Toplam Açık" value={openTasks.length} />
      </div>
      <SectionCard title="Kolon Bazında Ortalama Yaş">
        <ResponsiveContainer width="100%" height={Math.max(160, byColumn.length * 50)}>
          <BarChart data={byColumn} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis type="number" tick={cp.tick} unit=" gün" />
            <YAxis dataKey="status" type="category" tick={cp.tick} width={100} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Bar dataKey="avgAge" name="Ort. Yaş" fill="#60a5fa" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
      <SectionCard title="Uzun Süredir Bekleyen Görevler">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                {["Görev", "Kolon", "Yaş"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oldIssues.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{t.title}</td>
                  <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{t.columnTitle}</td>
                  <td className={`px-3 py-2.5 font-bold ${t.age >= 14 ? "text-red-500" : "text-amber-500"}`}>{t.age} gün</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}