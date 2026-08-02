import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { CheckCircle, Clock, Trash2 } from "lucide-react";
import { API_BASE } from "../config/api";

// Görev Tipi Tanımı
interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: string; // "LOW" | "MEDIUM" | "HIGH"
  dueDate: string | null;
  project?: { id: string; title: string } | null;
}

const Tasks = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filtre State'leri
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    setCurrentUser(user);
    fetchTasks(user.id);
  }, []);

  const fetchTasks = async (userId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Hata:", error);
      setTasks([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu görevi silmek istediğine emin misin?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/api/tasks/delete/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (currentUser) fetchTasks(currentUser.id);
  };

  const handleStatusChange = async (id: string, isCompleted: boolean) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/api/tasks/${id}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ action: isCompleted ? "NONE" : "COMPLETED" }),
    });
    if (currentUser) fetchTasks(currentUser.id);
  };

  const getStatusLabel = (isCompleted: boolean) => isCompleted ? "Tamamlandı" : "Bekliyor";
  const getPriorityLabel = (p: string) => p === "HIGH" ? "Yüksek" : p === "MEDIUM" ? "Orta" : "Düşük";
  const getPriorityBadgeColor = (p: string) => p === "HIGH" ? "bg-red-50 text-red-600" : p === "MEDIUM" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600";

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.project) map.set(t.project.id, t.project.title);
    });
    return Array.from(map.entries());
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === "DONE" && !task.isCompleted) return false;
    if (statusFilter === "TODO" && task.isCompleted) return false;
    if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
    if (projectFilter !== "ALL" && task.project?.id !== projectFilter) return false;
    return true;
  });

  const selectClass = `px-4 py-2.5 rounded-xl border outline-none text-sm font-semibold ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`;

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>

      {/* İÇERİK */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tüm Görevlerim</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Tüm Durumlar</option>
            <option value="TODO">Bekliyor</option>
            <option value="DONE">Tamamlandı</option>
          </select>
          <select className={selectClass} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="ALL">Tüm Öncelikler</option>
            <option value="LOW">Düşük</option>
            <option value="MEDIUM">Orta</option>
            <option value="HIGH">Yüksek</option>
          </select>
          <select className={selectClass} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="ALL">Tüm Projeler</option>
            {projectOptions.map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
        </div>

        <div className={`rounded-3xl shadow-sm border overflow-hidden transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <table className="w-full text-left">
            <thead className={`border-b ${darkMode ? 'bg-gray-900/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
              <tr>
                <th className="p-5 text-sm font-semibold">Görev Adı</th>
                <th className="p-5 text-sm font-semibold">Proje</th>
                <th className="p-5 text-sm font-semibold">Durum</th>
                <th className="p-5 text-sm font-semibold">Öncelik</th>
                <th className="p-5 text-sm font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                <tr key={task.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                  <td className={`p-5 font-medium ${task.isCompleted ? 'line-through opacity-50' : ''} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {task.title}
                  </td>
                  <td className={`p-5 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {task.project?.title ?? "-"}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 ${task.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {task.isCompleted ? <CheckCircle size={14}/> : <Clock size={14}/>} {getStatusLabel(task.isCompleted)}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityBadgeColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </td>
                  <td className="p-5 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleStatusChange(task.id, task.isCompleted)}
                      className={`p-2 rounded-lg transition-colors ${task.isCompleted ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
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
                  <td colSpan={5} className="p-10 text-center text-gray-400">Görev bulunamadı.</td>
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
