import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Play, Square, Clock, CheckCircle2, UserPlus, X } from "lucide-react"; 

// --- Tipler ---
type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW'; 
type CommentType = { id: string; user: string; text: string; createdAt: string };
type AttachmentType = { id: string; name: string; date: string; url: string };

type TaskType = { 
  id: string; 
  columnId: string; 
  title: string; 
  description: string; 
  dueDate: string;
  priority: PriorityType;
  assignee?: { name: string; email: string }; 
  isCompleted?: boolean; 
  totalTime?: number; 
  isTracking?: boolean;
  lastStartedAt?: string;
  comments?: CommentType[]; 
  attachments?: AttachmentType[]; 
};

type ColumnType = { id: string; title: string; color?: string; tasks: TaskType[] };
type MemberType = { id: string; name: string; email: string };

const Proje: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskAttachmentRef = useRef<HTMLInputElement>(null);

  const [now, setNow] = useState(Date.now());

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [members, setMembers] = useState<MemberType[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<PriorityType | "ALL">("ALL");

  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null); 
  const [commentText, setCommentText] = useState(""); 

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColModalOpen, setIsColModalOpen] = useState(false); 
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", priority: "MEDIUM" as PriorityType, assigneeMail: "" });
  const [newColTitle, setNewColTitle] = useState(""); 
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);


  const [isInviteProjectModalOpen, setIsInviteProjectModalOpen] = useState(false);
  const [selectedMemberToInvite, setSelectedMemberToInvite] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const presets = [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2000' },
    { id: 'p3', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000' }
  ];

  const columnColorOptions = [
    { name: "Gri", class: "bg-gray-200/90" },
    { name: "Mavi", class: "bg-blue-100/95" },
    { name: "Yeşil", class: "bg-emerald-100/95" },
    { name: "Sarı", class: "bg-amber-100/95" },
    { name: "Kırmızı", class: "bg-red-100/95" },
    { name: "Mor", class: "bg-purple-100/95" },
  ];

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  //Proje board sayfası yüklenmesi
  const fetchBoard = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/project/${projectId}/board`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setColumns(data.columns || []);
        if (data.orgId) fetchOrgMembers(data.orgId);
      }
    } catch (error) { console.error("Pano yüklenemedi:", error); }
    finally { setIsLoading(false); }
  };


  //organizasona üye olan kullanıcıları getirir
  const fetchOrgMembers = async (orgId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}/members`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch (error) { console.error("Üyeler çekilemedi"); }
  };

  useEffect(() => { fetchBoard(); }, [projectId]);

  const formatDisplayTime = (task: TaskType) => {
    let totalSeconds = task.totalTime || 0;
    if (task.isTracking && task.lastStartedAt) {
      const startTime = new Date(task.lastStartedAt).getTime();
      totalSeconds += Math.floor((now - startTime) / 1000);
    }
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  //görevin yapılma süresi
  const handleToggleTimer = async (e: React.MouseEvent, taskId: string, isTracking: boolean) => {
    e.stopPropagation();
    const action = isTracking ? "STOP" : "START";
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/timer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ action })
      });
      if (res.ok){
         fetchBoard();
      }
      
      else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) { console.error("Sayaç hatası:", error); }
  };

  //görevin tamamlanma 
  const toggleTaskComplete = async (e: React.MouseEvent, taskId: string, currentStatus: boolean) => {
    e.stopPropagation();
    const action = currentStatus ? "NONE" : "COMPLETED";

    setColumns(prevColumns => 
      prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.map(t => 
          t.id === taskId ? { ...t, isCompleted: !currentStatus } : t
        )
      }))
    );

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, isCompleted: !currentStatus } : null);
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ action })
      });
      
      if (!res.ok) {
        fetchBoard(); 
      }
    } catch (error) {
      console.error("Tik güncellenemedi:", error);
      fetchBoard();
    }
  };

  //sütun oluşturma
  const handleCreateColumn = async () => {
    if (!newColTitle.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/column/create/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title: newColTitle })
      });
      if (res.ok) { fetchBoard(); setIsColModalOpen(false); setNewColTitle(""); }
      else{
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) { alert("Sütun eklenemedi."); }
  };

  //görev oluşturma
  const handleSaveTask = async () => {
    if (!newTask.title || !activeColId || !newTask.assigneeMail) {
      alert("Lütfen başlık ve ekip üyesi seçtiğinizden emin olun.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/create/${projectId}/${activeColId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          date: newTask.dueDate,
          priority: newTask.priority,
          assigneeMail: newTask.assigneeMail
        })
      });
      if (res.ok) { fetchBoard(); closeTaskModal(); }
      else{
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) { alert("Görev hatası."); }
  };

  //sütun silme
  const deleteColumn = async (colId: string) => {
    if (!window.confirm("Sütun ve içindeki görevler silinecek?")) return;
    const token = localStorage.getItem("token");
    try {
       const res = await fetch(`http://localhost:5000/api/column/delete/${projectId}/${colId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if(res.ok){
        fetchBoard();
      }
      else{
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) { }
  };

  //görev silme
  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Görevi silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/delete/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if(res.ok){
        fetchBoard();
      }
      else{
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) { }
  };

  //görev taşıma
  const handleDrop = async (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/project/task/${taskId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ columnId: targetColId })
      });
      if (res.ok) fetchBoard();
    } catch (error) { }
  };

  //projeye üye dahil etme
  const handleInviteToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedMemberToInvite){
      alert("Lütfen davet edilecek bir üye seçin.");
      return;
    }

    setIsInviting(true);
    const token = localStorage.getItem("token");

    try{
      const res = await fetch(`http://localhost:5000/api/project/${projectId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ assigneeId: selectedMemberToInvite })
      });

      const data = await res.json();

      if (res.ok){
        alert("Üye projeye eklendi.");
        setIsInviteProjectModalOpen(false);
        setSelectedMemberToInvite("");
        fetchBoard();
      }
      else{
        alert(data.error || "Davet Başarısız.");
      }

    }catch(error){
      console.log("Davet Hatası: ",error);
      alert("Sunucu Hatası");
    } finally{
      setIsInviting(false);
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => e.dataTransfer.setData("taskId", taskId);

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setNewTask({ title: "", description: "", dueDate: "", priority: "MEDIUM", assigneeMail: "" });
  };

  const getPriorityColor = (p: PriorityType) => {
    if (p === 'HIGH') return 'bg-red-500 text-white border-transparent';
    if (p === 'MEDIUM') return 'bg-amber-400 text-white border-transparent';
    return 'bg-emerald-400 text-white border-transparent';
  };

  return (
    <div className="h-screen w-full bg-cover bg-center transition-all duration-700 flex flex-col font-sans overflow-hidden select-none"
      style={{ backgroundColor: "#F4F5F7", backgroundImage: bgImage ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${bgImage})` : 'none' }}>
      
      <header className="flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border-b border-gray-200 z-20 shadow-sm">
        <div className="flex items-center gap-4">

          <button onClick={() => navigate(-1)} className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity">← Geri Dön</button>
          <div className="h-6 w-[1px] bg-gray-300 mx-2" />
          <h1 className="font-black text-gray-800 tracking-tighter text-xl uppercase">Proje Panosu</h1>
        </div>

        <div className="flex flex-1 items-center justify-center px-10 gap-4">
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
            <input 
              type="text" placeholder="Görevlerde ara..." 
              className="w-full bg-gray-100 border-none rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

            <button 
              onClick={() => setIsInviteProjectModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              <UserPlus size={14} /> Ekle
            </button>



          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
              <button key={p} onClick={() => setSelectedPriority(p as any)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPriority === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {p === 'ALL' ? 'Hepsi' : p === 'HIGH' ? 'Yüksek' : p === 'MEDIUM' ? 'Orta' : 'Düşük'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-200/50 p-1.5 rounded-xl">
            {presets.map(p => (
              <button key={p.id} onClick={() => setBgImage(p.url)} className="w-7 h-7 rounded-lg bg-cover border-2 border-transparent hover:border-indigo-500 transition-all" style={{ backgroundImage: `url(${p.url})` }} />
            ))}
          </div>
          <button onClick={() => setBgImage(null)} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest">Temizle</button>
          <button onClick={() => fileInputRef.current?.click()} className="text-xs font-black text-indigo-600 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-100 uppercase">Resim</button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) { const r = new FileReader(); r.onloadend = () => setBgImage(r.result as string); r.readAsDataURL(file); }
          }} />
        </div>
      </header>

      <main className="flex-1 flex gap-6 p-6 overflow-x-auto items-start custom-scrollbar">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center font-bold opacity-30 tracking-[0.3em]">SENKRONİZE EDİLİYOR...</div>
        ) : (
          <>
            {columns.map((col) => (
              <div key={col.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col.id)} 
                className={`${col.color || 'bg-gray-200/90'} backdrop-blur-md w-[320px] shrink-0 rounded-[1.5rem] flex flex-col max-h-full shadow-lg border border-white/40`}>
                
                <div className="p-5 font-black text-gray-700 text-xs flex justify-between items-center relative tracking-widest uppercase">
                  <div className="flex items-center gap-2">
                    <span>{col.title}</span>
                    <span className="bg-black/10 px-2 py-0.5 rounded-full text-[9px] opacity-50">{col.tasks.length}</span>
                  </div>
                  <button onClick={() => setOpenSettingsId(openSettingsId === col.id ? null : col.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10">⚙️</button>
                  
                  {openSettingsId === col.id && (
                    <div className="absolute top-12 right-2 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-2xl p-4 z-30 border border-gray-100 w-52">
                      <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Renk Teması</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {columnColorOptions.map((opt) => (
                          <button key={opt.name} onClick={() => setOpenSettingsId(null)} className={`w-10 h-10 rounded-xl border-2 border-white ${opt.class} hover:scale-110 transition-transform`} />
                        ))}
                      </div>
                      <button onClick={() => deleteColumn(col.id)} className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 uppercase tracking-widest">Sütunu Kaldır</button>
                    </div>
                  )}
                </div>
                
                <div className="px-3 pb-3 flex flex-col gap-3 overflow-y-auto min-h-[50px] custom-scrollbar">
                  
                  {col.tasks
                    .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedPriority === "ALL" || t.priority === selectedPriority))
                    .map((task) => (
                    <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => setSelectedTask(task)}
                      className={`p-5 rounded-2xl shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-xl transition-all group relative ${task.isTracking ? 'bg-indigo-50/90 ring-2 ring-indigo-500 shadow-indigo-200' : 'bg-white/90 border-white'} ${task.isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                      
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => toggleTaskComplete(e, task.id, !!task.isCompleted)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white scale-110' : 'border-gray-200 text-transparent hover:border-emerald-500'}`}>
                            <CheckCircle2 size={12} strokeWidth={3} />
                          </button>
                          
                          <button 
                            onClick={(e) => handleToggleTimer(e, task.id, !!task.isTracking)}
                            className={`p-1 rounded-lg transition-all ${task.isTracking ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white'}`}
                          >
                            {task.isTracking ? <Square size={12} fill="white" /> : <Play size={12} />}
                          </button>
                        </div>
                        
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'HIGH' ? 'YÜKSEK' : task.priority === 'MEDIUM' ? 'ORTA' : 'DÜŞÜK'}
                        </span>
                      </div>

                      <h4 className={`font-bold text-sm mb-1 tracking-tight ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</h4>
                      <p className="text-gray-500 text-[11px] leading-snug line-clamp-2 mb-4 font-medium">{task.description}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-indigo-600 font-mono text-[10px] font-black">
                           <Clock size={12} />
                           {formatDisplayTime(task)}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-black uppercase shadow-sm">
                            {task.assignee?.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            @{task.assignee?.name?.split(' ')[0].toLowerCase() || 'boş'}
                          </span>
                           <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-[10px]">Sil 🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setActiveColId(col.id); setIsTaskModalOpen(true); }} className="mx-3 my-3 p-3 text-gray-400 hover:bg-white/50 hover:text-indigo-600 rounded-xl text-[10px] font-black border-2 border-dashed border-gray-300 transition-all uppercase tracking-widest">
                  + Yeni Kart
                </button>
              </div>
            ))}

            <button onClick={() => setIsColModalOpen(true)} className="bg-white/60 hover:bg-white/80 w-[320px] shrink-0 rounded-[1.5rem] py-10 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-indigo-300 text-indigo-400 transition-all shadow-sm group">
              <div className="text-2xl font-light group-hover:scale-125 transition-transform">+</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sütun Ekle</span>
            </button>
          </>
        )}
      </main>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-[#F4F5F7] w-full max-w-4xl h-[80vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            
            <div className={`h-24 w-full relative transition-colors duration-500 ${selectedTask.isTracking ? 'bg-red-500' : 'bg-indigo-600'}`}>
                <button onClick={() => setSelectedTask(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white text-xl transition-all">✕</button>
                {selectedTask.isTracking && <div className="absolute inset-0 flex items-center justify-center text-white font-black uppercase tracking-[0.5em] animate-pulse pointer-events-none">Görev Aktif Çalışılıyor...</div>}
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-[1.2] p-10 overflow-y-auto bg-white custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={(e) => toggleTaskComplete(e, selectedTask.id, !!selectedTask.isCompleted)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedTask.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 text-transparent hover:border-emerald-500'}`}>
                                <CheckCircle2 size={16} strokeWidth={3} />
                            </button>
                            <h2 className={`text-3xl font-black tracking-tighter ${selectedTask.isCompleted ? 'line-through text-gray-300' : 'text-gray-900'}`}>{selectedTask.title}</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-inner">
                             <Clock className="text-indigo-600" size={20} />
                             <span className="font-mono font-black text-xl text-indigo-600 w-24 text-center">{formatDisplayTime(selectedTask)}</span>
                             <button 
                                onClick={(e) => handleToggleTimer(e, selectedTask.id, !!selectedTask.isTracking)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black text-white transition-all shadow-md ${selectedTask.isTracking ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                             >
                                {selectedTask.isTracking ? "DURDUR" : "BAŞLAT"}
                             </button>
                        </div>
                    </div>

                    <div className="mb-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Açıklama</p>
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
                            {selectedTask.description || "Henüz açıklama eklenmedi."}
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2"><span>📎</span> Eklentiler</p>
                            <button onClick={() => taskAttachmentRef.current?.click()} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-colors uppercase">Dosya Yükle</button>
                            <input type="file" ref={taskAttachmentRef} className="hidden" accept="image/*" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {selectedTask.attachments?.map(att => (
                                <div key={att.id} className="border-2 border-gray-50 rounded-2xl p-3 flex items-center gap-4 bg-white hover:border-indigo-100 transition-all cursor-pointer group">
                                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">IMG</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 truncate">{att.name}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase mt-1">{att.date}</p>
                                    </div>
                                </div>
                            )) || <div className="col-span-2 py-8 border-2 border-dashed border-gray-100 rounded-2xl text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">Henüz bir görsel yok</div>}
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-[#F4F5F7] p-10 border-l border-gray-200 flex flex-col">
                    <p className="text-xs font-black text-gray-800 mb-6 uppercase tracking-widest flex items-center gap-2"><span>💬</span> Aktivite & Yorumlar</p>

                    <div className="mb-8">
                        <textarea 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Bir yorum bırakın..."
                            className="w-full bg-white border-none rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 resize-none h-28 shadow-sm placeholder:text-gray-300"
                        />
                        <div className="flex justify-end mt-3">
                            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest">Yorum Yap</button>
                        </div>
                    </div>

                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        {selectedTask.comments?.map(comment => (
                            <div key={comment.id} className="flex gap-4">
                                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 text-[10px] font-black border border-gray-100 flex-shrink-0">
                                    {comment.user.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[11px] font-black text-gray-900 uppercase tracking-tighter">{comment.user}</p>
                                            <span className="text-[9px] font-bold text-gray-400 italic">{comment.createdAt}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{comment.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SÜTUN EKLE MODAL --- */}
      {isColModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsColModalOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tighter uppercase">Yeni Sütun</h2>
            <input autoFocus placeholder="Sütun Başlığı..." className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold mb-6" value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setIsColModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-xl font-black text-gray-400 text-xs uppercase tracking-widest">İptal</button>
              <button onClick={handleCreateColumn} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest">Ekle</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PROJEYE ÜYE DAVET MODALI --- */}
      {isInviteProjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in" onClick={() => setIsInviteProjectModalOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Ekibe Kat</h2>
                <button onClick={() => setIsInviteProjectModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            
            <p className="text-xs text-gray-500 mb-6 font-medium">Bu projeye organizasyonunuzdan birini dahil edin. Sadece ekli üyeler panoyu görebilir.</p>

            <form onSubmit={handleInviteToProject} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Organizasyon Üyeleri</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm appearance-none cursor-pointer" 
                  value={selectedMemberToInvite} 
                  onChange={(e) => setSelectedMemberToInvite(e.target.value)}
                >
                  <option value="">Davet edilecek kişiyi seçin...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsInviteProjectModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">İptal</button>
                <button type="submit" disabled={isInviting} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                  {isInviting ? "Ekleniyor..." : "Projeye Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- KART EKLE MODAL --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeTaskModal}>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tighter uppercase">Yeni Kart</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Görev Adı</label>
                <input placeholder="Ne yapılacak?" className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Görevi Atanacak Üye</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm appearance-none cursor-pointer" value={newTask.assigneeMail} onChange={(e) => setNewTask({...newTask, assigneeMail: e.target.value})}>
                  <option value="">Üye Seçiniz...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.email}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Öncelik</label>
                  <select className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm appearance-none" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value as PriorityType})}>
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Bitiş Tarihi</label>
                  <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Açıklama</label>
                <textarea placeholder="Görev detaylarını buraya yazın..." className="w-full bg-gray-50 border-none rounded-2xl p-4 h-24 outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none text-sm" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={closeTaskModal} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 text-xs uppercase tracking-widest">İptal</button>
                <button onClick={handleSaveTask} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest">Kartı Oluştur</button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>

    
  );
};

export default Proje;