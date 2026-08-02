import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ArrowLeft, Plus, Play, CheckCircle2, Trash2, Target, Calendar, X, ListChecks,
} from "lucide-react";
import { API_BASE } from "../config/api";


type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

interface SprintTask {
  id: string;
  title: string;
  storyPoints: number;
  isCompleted: boolean;
  priority: string;
}

interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
  completedAt: string | null;
  tasks: SprintTask[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    committedPoints: number;
    completedPoints: number;
    completionRate: number;
  };
}

interface BoardTask {
  id: string;
  title: string;
  storyPoints?: number;
  sprintId?: string | null;
  isCompleted?: boolean;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_META: Record<SprintStatus, { label: string; bg: string; text: string }> = {
  PLANNED: { label: "Planlandı", bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300" },
  ACTIVE: { label: "Aktif", bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  COMPLETED: { label: "Tamamlandı", bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400" },
};

export default function Sprints() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [boardTasks, setBoardTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const [assignModalSprint, setAssignModalSprint] = useState<Sprint | null>(null);

  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchSprints = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sprints/project/${projectId}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sprintler yüklenemedi.");
      setSprints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  }, [projectId]);

  const fetchBoardTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/project/${projectId}/board`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) return;
      const tasks: BoardTask[] = (data?.columns || []).flatMap((c: any) => c.tasks || []);
      setBoardTasks(tasks);
    } catch {
      // proje panosu yoksa sessizce geç
    }
  }, [projectId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSprints(), fetchBoardTasks()]).finally(() => setLoading(false));
  }, [fetchSprints, fetchBoardTasks]);

  const createSprint = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/sprints/project/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ name: newName, goal: newGoal, startDate: newStart, endDate: newEnd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sprint oluşturulamadı.");
      setShowCreateModal(false);
      setNewName(""); setNewGoal(""); setNewStart(""); setNewEnd("");
      fetchSprints();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  const startSprint = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sprints/${id}/start`, { method: "PATCH", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Başlatılamadı.");
      fetchSprints();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  const completeSprint = async (id: string) => {
    if (!window.confirm("Sprint'i tamamlayıp geçmişe kaydetmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/sprints/${id}/complete`, { method: "PATCH", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tamamlanamadı.");
      fetchSprints();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  const deleteSprint = async (id: string) => {
    if (!window.confirm("Bu sprint silinsin mi? Görevler silinmez, sadece sprintten çıkarılır.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/sprints/${id}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silinemedi.");
      fetchSprints();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  const toggleTaskInSprint = async (taskId: string, sprintId: string | null) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}/sprint`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ sprintId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
      await Promise.all([fetchSprints(), fetchBoardTasks()]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const plannedSprints = sprints.filter((s) => s.status === "PLANNED");
  const completedSprints = sprints
    .filter((s) => s.status === "COMPLETED")
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

  const velocityData = [...completedSprints].reverse().map((s) => ({
    name: s.name,
    committed: s.metrics.committedPoints,
    completed: s.metrics.completedPoints,
  }));

  const unassignedTasks = boardTasks.filter((t) => !t.sprintId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
              title="Proje panosuna dön"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Sprintler</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} /> Yeni Sprint
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {loading && <p className="text-sm text-slate-400">Yükleniyor...</p>}

        {!loading && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Aktif Sprint</h2>
            {activeSprint ? (
              <SprintCard
                sprint={activeSprint}
                onComplete={() => completeSprint(activeSprint.id)}
                onDelete={() => deleteSprint(activeSprint.id)}
                onManageTasks={() => setAssignModalSprint(activeSprint)}
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-sm text-slate-400 dark:text-slate-500">
                Şu anda aktif bir sprint yok. Planlanan bir sprinti başlatabilir veya yeni oluşturabilirsiniz.
              </div>
            )}
          </section>
        )}

        {!loading && plannedSprints.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Planlanan Sprintler</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {plannedSprints.map((s) => (
                <SprintCard
                  key={s.id}
                  sprint={s}
                  onStart={() => startSprint(s.id)}
                  onDelete={() => deleteSprint(s.id)}
                  onManageTasks={() => setAssignModalSprint(s)}
                />
              ))}
            </div>
          </section>
        )}

        {!loading && completedSprints.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Velocity (Gerçek Geçmiş Verisi)</h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="committed" name="Taahhüt Edilen SP" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Tamamlanan SP" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {!loading && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Sprint Geçmişi {completedSprints.length > 0 && `(${completedSprints.length})`}
            </h2>
            {completedSprints.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-sm text-slate-400 dark:text-slate-500">
                Henüz tamamlanmış bir sprint yok. Bir sprinti tamamladığında burada kalıcı olarak görünecek.
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  <span>Sprint</span>
                  <span>Tarih Aralığı</span>
                  <span>Görevler</span>
                  <span>Puan (Tamamlanan / Taahhüt)</span>
                  <span>Tamamlanma</span>
                </div>
                {completedSprints.map((s) => (
                  <div key={s.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 py-3 items-center border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.name}</div>
                      {s.goal && <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{s.goal}</div>}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(s.startDate)} → {formatDate(s.endDate)}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{s.metrics.completedTasks}/{s.metrics.totalTasks}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{s.metrics.completedPoints}/{s.metrics.committedPoints} SP</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${s.metrics.completionRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : s.metrics.completionRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-500"}`}>
                      %{s.metrics.completionRate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Yeni Sprint</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sprint Adı</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Sprint 8"
                  className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Hedef (opsiyonel)</label>
                <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Ödeme akışını tamamla"
                  className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Başlangıç</label>
                  <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Bitiş</label>
                  <input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">İptal</button>
              <button onClick={createSprint} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Oluştur</button>
            </div>
          </div>
        </div>
      )}

      {assignModalSprint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setAssignModalSprint(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">"{assignModalSprint.name}" — Görevler</h3>
              <button onClick={() => setAssignModalSprint(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Sprintteki görevler</p>
            <div className="space-y-2 mb-5">
              {assignModalSprint.tasks.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">Henüz görev eklenmedi.</p>
              )}
              {assignModalSprint.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{t.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{t.storyPoints} SP</span>
                    <button
                      onClick={() => toggleTaskInSprint(t.id, null).then(() =>
                        setAssignModalSprint((prev) => prev ? { ...prev, tasks: prev.tasks.filter((x) => x.id !== t.id) } : prev)
                      )}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Çıkar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Panodaki sprintsiz görevler</p>
            <div className="space-y-2">
              {unassignedTasks.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">Eklenebilecek görev yok.</p>
              )}
              {unassignedTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{t.title}</span>
                  <button
                    onClick={() => toggleTaskInSprint(t.id, assignModalSprint.id).then(() => {
                      setAssignModalSprint((prev) => prev ? {
                        ...prev,
                        tasks: [...prev.tasks, { id: t.id, title: t.title, storyPoints: t.storyPoints || 0, isCompleted: !!t.isCompleted, priority: "MEDIUM" }],
                      } : prev);
                      setBoardTasks((prev) => prev.map((bt) => bt.id === t.id ? { ...bt, sprintId: assignModalSprint.id } : bt));
                    })}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    <Plus size={12} className="inline" /> Ekle
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SprintCard({
  sprint, onStart, onComplete, onDelete, onManageTasks,
}: {
  sprint: Sprint;
  onStart?: () => void;
  onComplete?: () => void;
  onDelete: () => void;
  onManageTasks: () => void;
}) {
  const meta = STATUS_META[sprint.status];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{sprint.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>{meta.label}</span>
          </div>
          {sprint.goal && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <Target size={11} /> {sprint.goal}
            </p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
            <Calendar size={11} /> {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
          </p>
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span>{sprint.metrics.totalTasks} görev</span>
        <span>{sprint.metrics.committedPoints} SP taahhüt</span>
        <span>{sprint.metrics.completedPoints} SP tamamlandı</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onManageTasks} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <ListChecks size={13} /> Görevleri Yönet
        </button>
        {sprint.status === "PLANNED" && onStart && (
          <button onClick={onStart} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
            <Play size={13} /> Başlat
          </button>
        )}
        {sprint.status === "ACTIVE" && onComplete && (
          <button onClick={onComplete} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors">
            <CheckCircle2 size={13} /> Tamamla
          </button>
        )}
      </div>
    </div>
  );
}