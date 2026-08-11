import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Plus, X, Flag, CheckCircle, Clock, Trash2 } from "lucide-react";
import { API_BASE } from "../config/api";


// Görev Tipi Tanımı (backend: PersonalTask)
interface Task {
  id: string;
  title: string;
  status: string; // "TODO" | "DONE"
  priority: string; // "LOW" | "MEDIUM" | "HIGH"
  dueDate: string | null;
}

const Tasks = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  // Modal ve Form State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", date: "", time: "", priority: "MEDIUM" });
  const [isLoading, setIsLoading] = useState(false);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoadingList(true);
    setListError("");
    try {
      const res = await fetch(`${API_BASE}/api/personal-tasks`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Görevler yüklenemedi.");
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Bir hata oluştu.");
      setTasks([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu görevi silmek istediğine emin misin?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/personal-tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Görev silinemedi.");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Bir hata oluştu.");
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    try {
      const res = await fetch(`${API_BASE}/api/personal-tasks/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Durum güncellenemedi.");
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Bir hata oluştu.");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setIsLoading(true);
    try {
      // Tarih + saat birleştirilip dueDate olarak gönderiliyor
      const dueDate = newTask.date
        ? new Date(`${newTask.date}T${newTask.time || "00:00"}`).toISOString()
        : null;

      const res = await fetch(`${API_BASE}/api/personal-tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          title: newTask.title,
          priority: newTask.priority,
          dueDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Görev oluşturulamadı.");

      setTasks((prev) => [...prev, data]);
      setIsModalOpen(false);
      setNewTask({ title: "", date: "", time: "", priority: "MEDIUM" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => (status === "DONE" ? "Tamamlandı" : "Bekliyor");
  const getPriorityLabel = (p: string) => (p === "HIGH" ? "Yüksek" : p === "MEDIUM" ? "Orta" : "Düşük");
  const getPriorityBadgeColor = (p: string) =>
    p === "HIGH" ? "bg-red-50 text-red-600" : p === "MEDIUM" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600";

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>

      {/* YENİ GÖREV MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl transition-colors ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Yeni Görev Oluştur</h2>
              <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}><X size={20}/></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Görev Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Yapılacak iş..."
                  className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Tarih</label>
                  <input
                    type="date"
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                    value={newTask.date}
                    onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Saat</label>
                  <input
                    type="time"
                    className={`w-full px-4 py-3 rounded-xl border outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {[
                  { val: 'LOW', label: 'Düşük' },
                  { val: 'MEDIUM', label: 'Orta' },
                  { val: 'HIGH', label: 'Yüksek' }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setNewTask({...newTask, priority: p.val})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 ${newTask.priority === p.val ? 'bg-blue-100 text-blue-600 border-blue-200' : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')}`}
                  >
                    <Flag size={16}/> {p.label}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg"
              >
                {isLoading ? "Ekleniyor..." : "Görevi Ekle"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* İÇERİK */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tüm Görevlerim</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg flex gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20}/> Yeni Görev
          </button>
        </div>

        {listError && <p className="text-sm text-red-500 mb-4">{listError}</p>}

        <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <table className="w-full text-left">
            <thead className={`border-b ${darkMode ? 'bg-gray-900/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
              <tr>
                <th className="p-5 text-sm font-semibold">Görev Adı</th>
                <th className="p-5 text-sm font-semibold">Durum</th>
                <th className="p-5 text-sm font-semibold">Öncelik</th>
                <th className="p-5 text-sm font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {loadingList ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">Yükleniyor...</td>
                </tr>
              ) : tasks.length > 0 ? tasks.map((task) => (
                <tr key={task.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                  <td className={`p-5 font-medium ${task.status === 'DONE' ? 'line-through opacity-50' : ''} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {task.title}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {task.status === 'DONE' ? <CheckCircle size={14}/> : <Clock size={14}/>} {getStatusLabel(task.status)}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityBadgeColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </td>
                  <td className="p-5 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleStatusChange(task.id, task.status)}
                      className={`p-2 rounded-lg transition-colors ${task.status === 'DONE' ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      title="Durumu Değiştir"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">Henüz hiç görev yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Tasks;