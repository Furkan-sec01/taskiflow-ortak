import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  ArrowLeft, Plus, RefreshCw, TrendingDown, TrendingUp,
  BarChart2,
  Zap, Layers, GitMerge, PieChart as PieIcon, Clock, X, Moon, Sun,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Status = "done" | "progress" | "todo" | "blocked";
type Priority = "high" | "medium" | "low";
interface Issue {
  key: string; summary: string; status: Status;
  priority: Priority; assignee: string; sp: number; age: number;
}

// ── Sabit proje meta verileri (hardcoded projeler) ─────────────────────────────
const STATIC_PROJECT_META: Record<string, { name: string; sprint: string }> = {
  "proj-alpha":   { name: "PROJ-Alpha",   sprint: "Sprint 7" },
  "proj-beta":    { name: "PROJ-Beta",    sprint: "Sprint 4" },
  "proj-gamma":   { name: "PROJ-Gamma",   sprint: "Sprint 2" },
  "proj-delta":   { name: "PROJ-Delta",   sprint: "Sprint 6" },
  "proj-epsilon": { name: "PROJ-Epsilon", sprint: "Sprint 3" },
  "proj-zeta":    { name: "PROJ-Zeta",    sprint: "Sprint 5" },
};

// ── localStorage'dan dinamik org'ları da dahil eden meta getter ────────────────
const getProjectMeta = (): Record<string, { name: string; sprint: string }> => {
  try {
    const stored = JSON.parse(localStorage.getItem("orgProjects") || "{}");
    return { ...STATIC_PROJECT_META, ...stored };
  } catch {
    return STATIC_PROJECT_META;
  }
};

// ── Initial Data ───────────────────────────────────────────────────────────────
const INITIAL_ISSUES: Issue[] = [
  { key: "PROJ-101", summary: "Login sayfası tasarımı", status: "done", priority: "high", assignee: "Ahmet K.", sp: 5, age: 3 },
  { key: "PROJ-102", summary: "API endpoint güvenlik testi", status: "done", priority: "high", assignee: "Zeynep M.", sp: 8, age: 5 },
  { key: "PROJ-103", summary: "Dashboard veri entegrasyonu", status: "progress", priority: "high", assignee: "Burak T.", sp: 13, age: 7 },
  { key: "PROJ-104", summary: "Kullanıcı profil sayfası", status: "progress", priority: "medium", assignee: "Selin A.", sp: 5, age: 4 },
  { key: "PROJ-105", summary: "Email bildirim sistemi", status: "todo", priority: "medium", assignee: "Ahmet K.", sp: 8, age: 10 },
  { key: "PROJ-106", summary: "Rapor export özelliği", status: "blocked", priority: "high", assignee: "Zeynep M.", sp: 8, age: 14 },
  { key: "PROJ-107", summary: "Arama fonksiyonu optimizasyonu", status: "done", priority: "low", assignee: "Burak T.", sp: 3, age: 2 },
  { key: "PROJ-108", summary: "Mobile responsive düzenlemeler", status: "progress", priority: "medium", assignee: "Selin A.", sp: 5, age: 6 },
  { key: "PROJ-109", summary: "Veritabanı indeks optimizasyonu", status: "done", priority: "high", assignee: "Ahmet K.", sp: 8, age: 8 },
  { key: "PROJ-110", summary: "Unit test kapsamı artırma", status: "todo", priority: "medium", assignee: "Zeynep M.", sp: 5, age: 9 },
  { key: "PROJ-111", summary: "CI/CD pipeline iyileştirme", status: "todo", priority: "low", assignee: "Burak T.", sp: 3, age: 11 },
  { key: "PROJ-112", summary: "Kullanıcı onboarding akışı", status: "progress", priority: "high", assignee: "Selin A.", sp: 13, age: 24 },
  { key: "PROJ-113", summary: "Hata izleme entegrasyonu", status: "done", priority: "medium", assignee: "Ahmet K.", sp: 5, age: 3 },
  { key: "PROJ-114", summary: "Performans benchmark raporu", status: "done", priority: "low", assignee: "Zeynep M.", sp: 3, age: 4 },
  { key: "PROJ-115", summary: "Erişilebilirlik (a11y) güncellemesi", status: "done", priority: "medium", assignee: "Burak T.", sp: 5, age: 5 },
  { key: "PROJ-116", summary: "GraphQL sorgu optimizasyonu", status: "done", priority: "high", assignee: "Selin A.", sp: 8, age: 6 },
];

// ── Static Chart Data ──────────────────────────────────────────────────────────
const BURNDOWN_DATA = [
  { day: "Gün 1", ideal: 80, actual: 80 },
  { day: "Gün 2", ideal: 71, actual: 75 },
  { day: "Gün 3", ideal: 62, actual: 68 },
  { day: "Gün 4", ideal: 53, actual: 62 },
  { day: "Gün 5", ideal: 44, actual: 58 },
  { day: "Gün 6", ideal: 36, actual: 50 },
  { day: "Gün 7", ideal: 27, actual: 42 },
  { day: "Gün 8", ideal: 18, actual: 38 },
  { day: "Gün 9", ideal: 9, actual: 28 },
];
const BURNUP_DATA = [
  { day: "Gün 1", completed: 0, scope: 72 },
  { day: "Gün 2", completed: 5, scope: 72 },
  { day: "Gün 3", completed: 12, scope: 72 },
  { day: "Gün 4", completed: 18, scope: 80 },
  { day: "Gün 5", completed: 24, scope: 80 },
  { day: "Gün 6", completed: 32, scope: 80 },
  { day: "Gün 7", completed: 38, scope: 80 },
  { day: "Gün 8", completed: 44, scope: 80 },
  { day: "Gün 9", completed: 52, scope: 80 },
];
const VELOCITY_DATA = [
  { sprint: "Sprint 2", committed: 60, completed: 55 },
  { sprint: "Sprint 3", committed: 65, completed: 62 },
  { sprint: "Sprint 4", committed: 58, completed: 41 },
  { sprint: "Sprint 5", committed: 70, completed: 67 },
  { sprint: "Sprint 6", committed: 68, completed: 72 },
  { sprint: "Sprint 7", committed: 80, completed: 52 },
];
const CFD_DATA = [
  { date: "22 Oca", todo: 14, progress: 6, review: 3, done: 2 },
  { date: "23 Oca", todo: 13, progress: 7, review: 4, done: 4 },
  { date: "24 Oca", todo: 12, progress: 8, review: 5, done: 7 },
  { date: "25 Oca", todo: 11, progress: 8, review: 6, done: 9 },
  { date: "26 Oca", todo: 11, progress: 7, review: 7, done: 11 },
  { date: "27 Oca", todo: 10, progress: 8, review: 6, done: 13 },
  { date: "28 Oca", todo: 10, progress: 7, review: 7, done: 14 },
  { date: "29 Oca", todo: 12, progress: 7, review: 6, done: 16 },
  { date: "30 Oca", todo: 12, progress: 7, review: 6, done: 17 },
  { date: "31 Oca", todo: 12, progress: 7, review: 5, done: 18 },
];
const CONTROL_DATA = Array.from({ length: 20 }, (_, i) => ({
  task: `#${i + 1}`,
  cycleTime: [2, 3, 4, 2, 1, 5, 3, 11, 2, 3, 4, 2, 3, 8, 2, 3, 4, 2, 1, 3][i],
}));
const CREATED_DATA = [
  { month: "Eyl", created: 18, resolved: 14 },
  { month: "Eki", created: 22, resolved: 16 },
  { month: "Kas", created: 16, resolved: 18 },
  { month: "Ara", created: 14, resolved: 15 },
  { month: "Oca", created: 12, resolved: 11 },
  { month: "Şub", created: 12, resolved: 4 },
];
const AGE_DATA = [
  { status: "Yapılacak", avgAge: 9.2 },
  { status: "Devam Eden", avgAge: 6.8 },
  { status: "İncelemede", avgAge: 4.1 },
  { status: "Bloke", avgAge: 15.3 },
];

// ── Color Helpers ──────────────────────────────────────────────────────────────
const STATUS_COLORS_LIGHT: Record<Status, { bg: string; text: string; label: string }> = {
  done:     { bg: "bg-emerald-50", text: "text-emerald-700", label: "✓ Tamamlandı" },
  progress: { bg: "bg-blue-50",    text: "text-blue-700",    label: "↻ Devam" },
  todo:     { bg: "bg-slate-100",  text: "text-slate-600",   label: "◦ Yapılacak" },
  blocked:  { bg: "bg-red-50",     text: "text-red-700",     label: "✕ Bloke" },
};
const STATUS_COLORS_DARK: Record<Status, { bg: string; text: string; label: string }> = {
  done:     { bg: "bg-emerald-900/40", text: "text-emerald-400", label: "✓ Tamamlandı" },
  progress: { bg: "bg-blue-900/40",    text: "text-blue-400",    label: "↻ Devam" },
  todo:     { bg: "bg-slate-700",      text: "text-slate-300",   label: "◦ Yapılacak" },
  blocked:  { bg: "bg-red-900/40",     text: "text-red-400",     label: "✕ Bloke" },
};
const PRIORITY_COLORS: Record<Priority, string> = {
  high: "text-red-500 font-bold", medium: "text-amber-500 font-semibold", low: "text-emerald-500",
};
const PRIORITY_LABELS: Record<Priority, string> = {
  high: "↑ Yüksek", medium: "→ Orta", low: "↓ Düşük",
};
const AVATAR_COLORS: Record<string, string> = {
  "Ahmet K.": "#3b82f6", "Zeynep M.": "#8b5cf6",
  "Burak T.": "#10b981", "Selin A.": "#f59e0b",
};
const PIE_STATUS_COLORS = ["#10b981", "#3b82f6", "#cbd5e1", "#ef4444"];
const PIE_PRIORITY_COLORS = ["#ef4444", "#f59e0b", "#10b981"];

// ── useDark hook ───────────────────────────────────────────────────────────────
function useDark() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const toggleDark = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(!isDark);
  };
  return { dark, toggleDark };
}

// ── Sub-components ─────────────────────────────────────────────────────────────
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

const chartProps = (dark: boolean) => ({
  cartesianGrid: { stroke: dark ? "#334155" : "#f1f5f9" },
  tick: { fill: dark ? "#94a3b8" : "#64748b", fontSize: 12 },
  tooltipStyle: dark
    ? { backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" }
    : {},
});

// ── Tab Panels ─────────────────────────────────────────────────────────────────
function BurndownPanel({ dark }: { dark: boolean }) {
  const cp = chartProps(dark);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Toplam SP" value={80} sub="Sprint 7" />
        <KpiCard label="Kalan" value={28} sub="story point" color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="Tamamlanan" value={52} sub="story point" color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Sprint Durumu" value="🟡 Geride" sub="4 gün kaldı" />
      </div>
      <SectionCard title="Burndown Chart — Sprint 7" subtitle="Kalan iş vs ideal ilerleme çizgisi">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={BURNDOWN_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="day" tick={cp.tick} />
            <YAxis tick={cp.tick} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="actual" name="Gerçekleşen" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="ideal" name="İdeal" stroke={dark ? "#475569" : "#cbd5e1"} strokeWidth={2} strokeDasharray="6 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function BurnupPanel({ dark }: { dark: boolean }) {
  const cp = chartProps(dark);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Toplam Hedef" value={80} />
        <KpiCard label="Tamamlanan" value={52} color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Kapsam Değişimi" value="+8" sub="SP eklendi" color="text-amber-500" />
        <KpiCard label="İlerleme" value="65%" color="text-blue-600 dark:text-blue-400" />
      </div>
      <SectionCard title="Burnup Chart — Sprint 7" subtitle="Tamamlanan iş & kapsam çizgisi">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={BURNUP_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="day" tick={cp.tick} />
            <YAxis tick={cp.tick} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="completed" name="Tamamlanan" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="scope" name="Toplam Kapsam" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function SprintPanel({ issues, onAdd, dark }: { issues: Issue[]; onAdd: () => void; dark: boolean }) {
  const counts = useMemo(() => ({
    done: issues.filter(i => i.status === "done").length,
    progress: issues.filter(i => i.status === "progress").length,
    todo: issues.filter(i => i.status === "todo").length,
    blocked: issues.filter(i => i.status === "blocked").length,
  }), [issues]);
  const SC = dark ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Tamamlanan" value={counts.done} sub="görev" color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Devam Eden" value={counts.progress} color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="Yapılacak" value={counts.todo} />
        <KpiCard label="Bloke" value={counts.blocked} color="text-red-500" />
      </div>
      <SectionCard title="Sprint 7 — Görev Listesi">
        <div className="flex justify-end mb-3">
          <button onClick={onAdd} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={13} /> Görev Ekle
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                {["Anahtar", "Özet", "Durum", "Öncelik", "Atanan", "SP"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => {
                const sc = SC[issue.status];
                const initials = issue.assignee.split(" ").map(x => x[0]).join("");
                return (
                  <tr key={issue.key} className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-3 py-2.5 text-blue-600 dark:text-blue-400 font-bold text-xs">{issue.key}</td>
                    <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{issue.summary}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 text-xs ${PRIORITY_COLORS[issue.priority]}`}>{PRIORITY_LABELS[issue.priority]}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ background: AVATAR_COLORS[issue.assignee] || "#94a3b8" }}>
                          {initials}
                        </div>
                        <span className="text-slate-600 dark:text-slate-400">{issue.assignee}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">{issue.sp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function VelocityPanel({ dark }: { dark: boolean }) {
  const cp = chartProps(dark);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Ort. Velocity" value={58} sub="SP / sprint" color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="En Yüksek" value={72} color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="En Düşük" value={41} color="text-red-500" />
        <KpiCard label="Tahmin (S8)" value={60} sub="SP önerisi" />
      </div>
      <SectionCard title="Velocity Chart — Son 6 Sprint">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={VELOCITY_DATA}>
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

function CFDPanel({ dark }: { dark: boolean }) {
  const cp = chartProps(dark);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Yapılacak" value={12} />
        <KpiCard label="Devam Eden" value={7} color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="İncelemede" value={5} color="text-amber-500" />
        <KpiCard label="Tamamlanan" value={18} color="text-emerald-600 dark:text-emerald-400" />
      </div>
      <SectionCard title="Cumulative Flow Diagram" subtitle="İş durumu dağılımı (son 2 hafta)">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={CFD_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="date" tick={cp.tick} />
            <YAxis tick={cp.tick} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
            <Area type="monotone" dataKey="done" name="Tamamlanan" stackId="1" stroke="#10b981" fill={dark ? "#064e3b" : "#d1fae5"} />
            <Area type="monotone" dataKey="review" name="İncelemede" stackId="1" stroke="#f59e0b" fill={dark ? "#78350f" : "#fef3c7"} />
            <Area type="monotone" dataKey="progress" name="Devam Eden" stackId="1" stroke="#3b82f6" fill={dark ? "#1e3a5f" : "#dbeafe"} />
            <Area type="monotone" dataKey="todo" name="Yapılacak" stackId="1" stroke="#93c5fd" fill={dark ? "#1e2d3d" : "#eff6ff"} />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function ControlPanel({ dark }: { dark: boolean }) {
  const cp = chartProps(dark);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Ort. Cycle Time" value="3.2" sub="gün" color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="Medyan" value="2.8" sub="gün" />
        <KpiCard label="Maksimum" value={11} sub="gün" color="text-red-500" />
        <KpiCard label="Anormal" value={3} sub="görev" color="text-amber-500" />
      </div>
      <SectionCard title="Control Chart — Cycle Time" subtitle="Her görevin tamamlanma süresi">
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="index" name="Görev" tick={cp.tick} />
            <YAxis dataKey="cycleTime" name="Gün" tick={cp.tick} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={cp.tooltipStyle} />
            <ReferenceLine y={8} stroke="#fca5a5" strokeDasharray="5 5" label={{ value: "UCL", fontSize: 11, fill: "#ef4444" }} />
            <ReferenceLine y={3.2} stroke="#86efac" strokeDasharray="5 5" label={{ value: "Ort.", fontSize: 11, fill: "#10b981" }} />
            <Scatter data={CONTROL_DATA.map((d, i) => ({ ...d, index: i + 1 }))} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function CreatedPanel({ dark }: { dark: boolean }) {
  const cp = chartProps(dark);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Toplam Açılan" value={94} />
        <KpiCard label="Toplam Çözülen" value={78} color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Birikmiş" value={16} color="text-red-500" />
        <KpiCard label="Çözüm Oranı" value="83%" color="text-blue-600 dark:text-blue-400" />
      </div>
      <SectionCard title="Created vs Resolved Issues">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={CREATED_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis dataKey="month" tick={cp.tick} />
            <YAxis tick={cp.tick} />
            <Tooltip contentStyle={cp.tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="created" name="Açılan" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="resolved" name="Çözülen" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function PiePanel({ issues, dark }: { issues: Issue[]; dark: boolean }) {
  const statusCounts = useMemo(() => [
    { name: "Tamamlanan", value: issues.filter(i => i.status === "done").length },
    { name: "Devam Eden", value: issues.filter(i => i.status === "progress").length },
    { name: "Yapılacak", value: issues.filter(i => i.status === "todo").length },
    { name: "Bloke", value: issues.filter(i => i.status === "blocked").length },
  ], [issues]);
  const priorityCounts = useMemo(() => [
    { name: "Yüksek", value: issues.filter(i => i.priority === "high").length },
    { name: "Orta", value: issues.filter(i => i.priority === "medium").length },
    { name: "Düşük", value: issues.filter(i => i.priority === "low").length },
  ], [issues]);
  const cp = chartProps(dark);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Toplam Görev" value={issues.length} />
        <KpiCard label="Tamamlanan" value={statusCounts[0].value} color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Devam Eden" value={statusCounts[1].value} color="text-blue-600 dark:text-blue-400" />
        <KpiCard label="Yapılacak" value={statusCounts[2].value} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="Durum Dağılımı">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {statusCounts.map((_, i) => <Cell key={i} fill={PIE_STATUS_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={cp.tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Öncelik Dağılımı">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {priorityCounts.map((_, i) => <Cell key={i} fill={PIE_PRIORITY_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={cp.tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
}

function AgePanel({ issues, dark }: { issues: Issue[]; dark: boolean }) {
  const oldIssues = useMemo(() =>
    issues.filter(i => i.age >= 7 && i.status !== "done").sort((a, b) => b.age - a.age),
    [issues]
  );
  const cp = chartProps(dark);
  const SC = dark ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Ort. Yaş" value="8.4" sub="gün" color="text-amber-500" />
        <KpiCard label="En Yaşlı" value={24} sub="gün" color="text-red-500" />
        <KpiCard label="Kritik (>14g)" value={oldIssues.filter(i => i.age > 14).length} color="text-red-500" />
        <KpiCard label="Toplam Açık" value={issues.filter(i => i.status !== "done").length} />
      </div>
      <SectionCard title="Average Age Report" subtitle="Durum bazında ortalama yaş">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={AGE_DATA} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={cp.cartesianGrid.stroke} />
            <XAxis type="number" tick={cp.tick} unit=" gün" />
            <YAxis dataKey="status" type="category" tick={cp.tick} width={90} />
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
                {["Anahtar", "Özet", "Durum", "Yaş"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oldIssues.map(issue => {
                const sc = SC[issue.status];
                return (
                  <tr key={issue.key} className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-3 py-2.5 text-blue-600 dark:text-blue-400 font-bold text-xs">{issue.key}</td>
                    <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{issue.summary}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 font-bold ${issue.age >= 14 ? "text-red-500" : issue.age >= 7 ? "text-amber-500" : "text-slate-700 dark:text-slate-300"}`}>
                      {issue.age} gün
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Add Issue Modal ────────────────────────────────────────────────────────────
function AddIssueModal({ onClose, onAdd }: { onClose: () => void; onAdd: (issue: Issue) => void }) {
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<Status>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState("Ahmet K.");
  const [sp, setSp] = useState(3);
  const handleSubmit = () => {
    if (!summary.trim()) return;
    onAdd({
      key: `PROJ-${Math.floor(Math.random() * 900) + 100}`,
      summary: summary.trim(),
      status, priority, assignee, sp, age: 0,
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">Yeni Görev Oluştur</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Özet *</label>
            <input value={summary} onChange={e => setSummary(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
              placeholder="Görev başlığını girin..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Durum", value: status, onChange: (v: string) => setStatus(v as Status), options: [["todo","Yapılacak"],["progress","Devam Ediyor"],["done","Tamamlandı"],["blocked","Bloke"]] },
              { label: "Öncelik", value: priority, onChange: (v: string) => setPriority(v as Priority), options: [["high","Yüksek"],["medium","Orta"],["low","Düşük"]] },
              { label: "Atanan", value: assignee, onChange: (v: string) => setAssignee(v), options: Object.keys(AVATAR_COLORS).map(a => [a, a]) },
            ].map(({ label, value, onChange, options }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
                <select value={value} onChange={e => onChange(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition">
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Story Points</label>
              <input type="number" min={1} max={21} value={sp} onChange={e => setSp(Number(e.target.value))}
                className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              İptal
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Görev Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab Config ─────────────────────────────────────────────────────────────────
type TabId = "burndown" | "burnup" | "sprint" | "velocity" | "cfd" | "control" | "created" | "pie" | "age";
const TABS: { id: TabId; label: string; icon: React.ReactNode; group: string }[] = [
  { id: "burndown", label: "Burndown",    icon: <TrendingDown size={14} />, group: "Sprint & Agile" },
  { id: "burnup",   label: "Burnup",      icon: <TrendingUp size={14} />,   group: "Sprint & Agile" },
  { id: "sprint",   label: "Sprint",      icon: <Zap size={14} />,          group: "Sprint & Agile" },
  { id: "velocity", label: "Velocity",    icon: <BarChart2 size={14} />,    group: "Sprint & Agile" },
  { id: "cfd",      label: "Flow",        icon: <Layers size={14} />,       group: "Süreç" },
  { id: "control",  label: "Control",     icon: <GitMerge size={14} />,     group: "Süreç" },
  { id: "created",  label: "Cr. vs Res.", icon: <RefreshCw size={14} />,    group: "Analiz" },
  { id: "pie",      label: "Pie Chart",   icon: <PieIcon size={14} />,      group: "Analiz" },
  { id: "age",      label: "Avg. Age",    icon: <Clock size={14} />,        group: "Analiz" },
];

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Reports() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<TabId>("burndown");
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [showModal, setShowModal] = useState(false);
  const { dark, toggleDark } = useDark();

  // localStorage'daki dinamik org'lar dahil tüm meta verileri al
  const allProjectMeta = getProjectMeta();

  // Proje meta bilgisi — bilinmiyorsa fallback
  const meta = (projectId && allProjectMeta[projectId]) ?? { name: "TaskiFlow", sprint: "Sprint 1" };

  const addIssue = (issue: Issue) => setIssues(prev => [...prev, issue]);
  const activeLabel = TABS.find(t => t.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      {/* Top bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/reports")}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
              title="Raporlar listesine dön"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <button
              onClick={() => navigate("/reports")}
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Raporlar
            </button>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{meta.name}</span>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              title={dark ? "Açık moda geç" : "Koyu moda geç"}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Plus size={14} /> Görev Ekle
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              {meta.name} · {meta.sprint}
            </div>
          </div>
        </div>
        {/* Tab bar */}
        <div className="max-w-screen-xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-1 pb-0">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                }`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6">
        {activeTab === "burndown" && <BurndownPanel dark={dark} />}
        {activeTab === "burnup"   && <BurnupPanel dark={dark} />}
        {activeTab === "sprint"   && <SprintPanel issues={issues} onAdd={() => setShowModal(true)} dark={dark} />}
        {activeTab === "velocity" && <VelocityPanel dark={dark} />}
        {activeTab === "cfd"      && <CFDPanel dark={dark} />}
        {activeTab === "control"  && <ControlPanel dark={dark} />}
        {activeTab === "created"  && <CreatedPanel dark={dark} />}
        {activeTab === "pie"      && <PiePanel issues={issues} dark={dark} />}
        {activeTab === "age"      && <AgePanel issues={issues} dark={dark} />}
      </main>

      {showModal && <AddIssueModal onClose={() => setShowModal(false)} onAdd={addIssue} />}
    </div>
  );
}