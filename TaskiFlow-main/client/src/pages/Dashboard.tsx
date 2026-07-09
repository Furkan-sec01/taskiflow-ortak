import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard, FolderKanban, Settings, LogOut, Bell, Search, Plus, X,
  Folder, Calendar, ChevronRight, AlertCircle, Activity, Layout as LayoutIcon, Building2, CheckCircle2
} from "lucide-react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis
} from 'recharts';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [projectCount, setProjectCount] = useState(0);

  const [userOrgs, setUserOrgs] = useState<any[]>([]);
  const [newProject, setNewProject] = useState({ title: "", description: "", organizationId: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
    } else {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      fetchProjects();
      fetchUserOrgs();
    }
  }, []);

  const fetchUserOrgs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/organizations", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUserOrgs(data);
        if (data.length > 0) {
          setNewProject(prev => ({ ...prev, organizationId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Organizasyonlar çekilemedi:", error);
    }
  };

  const fetchProjects = async () => {
    setErrorMessage("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/project/my-projects", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const projectList = data.projects || (Array.isArray(data) ? data : []);
        setProjects(projectList);
        setProjectCount(projectList.length);
      } else {
        throw new Error("Projeler yüklenemedi.");
      }
    } catch (error) {
      setErrorMessage("Sunucuyla bağlantı kurulamadı.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.organizationId) {
      alert("Lütfen tüm alanları doldurun ve bir çalışma alanı seçin.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewProject({ title: "", description: "", organizationId: userOrgs[0]?.id || "" });
        
        fetchProjects();
      } else {
        const data = await res.json();
        alert(data.error || "Proje oluşturulamadı.");
      }
    } catch (error) {
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const userProjects = projects.filter((p: any) => p.role === "user");
  const adminProjects = projects.filter((p: any) => p.role === "admin");

  const calculateProgress = (projectArray: any[]) => {
    if (projectArray.length === 0) return 0;
    let totalScore = 0;
    projectArray.forEach((p) => {
      const totalTasks = p.totalTasks || 0;
      const completedTasks = p.completedTasks || 0;
      const inProgressTasks = p.inProgressTasks || 0;
      const value = (totalTasks - completedTasks - inProgressTasks) / 2;
      totalScore += value;
    });
    const percent = Math.round(totalScore / projectArray.length);
    return Math.max(0, Math.min(100, percent));
  };

  const userProgress = calculateProgress(userProjects);
  const adminProgress = calculateProgress(adminProjects);
  const avgProgress = Math.round((userProgress + adminProgress) / 2) || 0;
  const completedCount = projects.filter((p) => (p.progress || 0) === 100).length;
  const inProgressCount = projects.length - completedCount;

  const radialData = [
    { name: "Progress", value: avgProgress, fill: "#3B82F6" }
  ];

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#0F172A] text-slate-200' : 'bg-[#F1F5F9] text-slate-900'}`}>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-6">
          <div className={`w-full max-w-lg p-10 rounded-[2rem] shadow-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Yeni Proje Kaydı</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 opacity-70 flex items-center gap-2">
                  <Building2 size={14} /> ÇALIŞMA ALANI SEÇİN
                </label>
                <select
                  required
                  value={newProject.organizationId}
                  onChange={(e) => setNewProject({ ...newProject, organizationId: e.target.value })}
                  className={`w-full px-6 py-4 rounded-xl border-2 outline-none focus:border-blue-500 transition-all font-medium appearance-none ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                >
                  {userOrgs.length === 0 && <option value="">Önce bir ekip kurmalısınız</option>}
                  {userOrgs.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 opacity-70">PROJE ADI</label>
                <input type="text" required value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className={`w-full px-6 py-4 rounded-xl border-2 outline-none focus:border-blue-500 transition-all font-medium ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`} placeholder="E-Ticaret Web Sitesi..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 opacity-70">AÇIKLAMA</label>
                <textarea rows={3} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className={`w-full px-6 py-4 rounded-xl border-2 outline-none focus:border-blue-500 transition-all font-medium ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`} placeholder="Projenin temel hedefleri..." />
              </div>
              <button type="submit" disabled={isLoading || userOrgs.length === 0} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50">
                {isLoading ? "İşleniyor..." : "Projeyi Onayla"}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-24 flex items-center justify-between px-12 border-b ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/70 border-slate-200'} backdrop-blur-xl`}>
          <div>
            <h1 className="text-2xl font-bold">Hoş Geldiniz, {currentUser?.name?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Proje kayıtlarında ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`pl-12 pr-6 py-3 rounded-xl text-sm w-72 outline-none border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-100 border-transparent focus:bg-white focus:border-slate-300'}`} />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-7 py-3 rounded-xl font-bold shadow-blue-500/20 shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
              <Plus size={20} /> Yeni Proje
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-transparent">
          {errorMessage && <div className="p-5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 font-semibold shadow-sm"><AlertCircle size={20} /> {errorMessage}</div>}

          <section>
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Kayıtlı Projeler</h2>
              <div className="h-[2px] flex-1 mx-8 bg-slate-200 dark:bg-slate-800 opacity-50"></div>
              <span className="text-sm font-bold opacity-40 uppercase tracking-widest">{projects.length} TOPLAM</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {projects.length === 0 ? (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[3rem] opacity-30">
                  <LayoutIcon size={48} className="mx-auto mb-4" />
                  <p className="font-bold text-lg">Görüntülenecek proje bulunamadı.</p>
                </div>
              ) : (
                projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => (
                  <ProjectCard key={project.id} project={project} darkMode={darkMode} />
                ))
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-12 items-stretch">
            <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
              <StatBox title="Toplam Proje" value={projectCount} icon={<Folder size={22} />} accentColor="blue" darkMode={darkMode} />
              <StatBox title="Kullanıcı Tamamlanma" value={`${userProgress}%`} icon={<Activity size={22} />} accentColor="emerald" darkMode={darkMode} />
              <StatBox title="Admin Tamamlanma" value={`${adminProgress}%`} icon={<Activity size={22} />} accentColor="purple" darkMode={darkMode} />
            </div>

            <div className={`lg:col-span-3 p-10 rounded-[2.5rem] border shadow-sm flex flex-col ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-8 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                <div className="flex-1 space-y-6 w-full md:w-auto">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tight">Genel İlerleme</h3>
                    <p className="text-sm font-medium opacity-50 max-w-sm">Aktif projelerin ortalama verimlilik skoru.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Biten</p>
                      <p className="text-xl font-black text-emerald-500">{completedCount}</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Aktif</p>
                      <p className="text-xl font-black text-blue-500">{inProgressCount}</p>
                    </div>
                  </div>
                </div>
                <div className="h-44 w-44 relative flex items-center justify-center mt-6 md:mt-0 flex-shrink-0">
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span className="text-3xl font-black tracking-tighter">%{avgProgress}</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" barSize={10} data={radialData} startAngle={90} endAngle={450}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }} dataKey="value" cornerRadius={30} fill="#3B82F6" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
          
              <div className="flex flex-col flex-1">
                <h4 className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-6">Proje Bazlı Dağılım</h4>
                <div className="h-[280px] overflow-y-auto pr-4 custom-scrollbar space-y-4">
                  {projects.length === 0 ? (
                    <p className="text-xs opacity-50 italic text-center py-4">Henüz proje verisi bulunmuyor.</p>
                  ) : (
                    projects.map((project) => (
                      <div key={project.id} className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-full border-4 flex items-center justify-center font-black text-[10px] ${project.progress === 100 ? 'border-emerald-500 text-emerald-500' : 'border-blue-500 text-blue-500'}`}>
                              %{project.progress || 0}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{project.title}</h4>
                              <div className="flex gap-4 text-[10px] font-bold opacity-50 uppercase mt-1">
                                <span>{project.totalTasks || 0} görev</span>
                                <span>{project.completedTasks || 0} tamamlandı</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex -space-x-2">
                             {(project.members || []).map((m: any, idx: number) => (
                               <div key={m.id || idx} title={m.name} className="h-7 w-7 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-bold overflow-hidden">
                                 {m.avatarUrl ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" /> : m.name?.charAt(0).toUpperCase()}
                               </div>
                             ))}
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className={`${project.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'} h-full rounded-full transition-all duration-1000`} style={{ width: `${project.progress || 0}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? '#334155' : '#cbd5e1'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3B82F6; }
      `}</style>
    </div>
  );
};

const StatBox = ({ title, value, icon, accentColor, darkMode }: any) => {
  const accentClasses: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  };
  return (
    <div className={`p-8 rounded-3xl border shadow-sm transition-all hover:shadow-md flex-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-black tracking-[0.2em] opacity-40 uppercase">{title}</p>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accentClasses[accentColor]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>
  );
};

const ProjectCard = ({ project, darkMode }: any) => {
  
  const projectMembers = project.members || [];

  return (
    <div className={`group p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:border-blue-500/50 hover:-translate-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-8">
        <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 text-blue-600 rounded-2xl flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white shadow-inner">
          <FolderKanban size={24} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] font-bold tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full uppercase">
            {project.progress === 100 ? "Tamamlandı" : "Aktif"}
          </span>
        </div>
      </div>
      <h4 className="text-xl font-bold mb-3 tracking-tight group-hover:text-blue-500 transition-colors">{project.title}</h4>
      <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-8 h-10">{project.description || "Resmi kayıt açıklaması bulunmuyor."}</p>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-1000"
          style={{ width: `${project.progress || 0}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex -space-x-2">
          {projectMembers.slice(0, 3).map((m: any, idx: number) => (
              <div key={m.id || idx} title={m.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                  {m.avatarUrl ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" /> : m.name?.charAt(0).toUpperCase()}
              </div>
          ))}
          {projectMembers.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  +{projectMembers.length - 3}
              </div>
          )}
        </div>
        <Link to={`/projects/${project.id}`} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-3 transition-all">
          Detay <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;