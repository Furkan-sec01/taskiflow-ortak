import React, { useState, useEffect } from "react";
import { Activity, TrendingUp, Users, Award, Loader2, Layout, Zap } from "lucide-react";

interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface Project {
  id: string | number;
  title: string;
  description: string;
  organization?: { name: string };
  members?: Member[];
}

const Pulse: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/project/my-projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const fetchedProjects = data.projects || [];
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0) setSelectedProject(fetchedProjects[0]);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getAnalyzedData = () => {
    if (!selectedProject?.members) return [];
    return selectedProject.members.map((m, index) => {
      // Backend'den gerçek rakamlar gelene kadar üyeye özel tutarlı random veri
      const total = 10 + (index % 3); 
      const done = 5 + (index % 5);
      return { ...m, total, done, score: Math.round((done / total) * 100) };
    }).sort((a, b) => b.done - a.done);
  };

  const membersData = getAnalyzedData();
  const totalCompleted = membersData.reduce((acc, curr) => acc + curr.done, 0);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-all">
      
      {/* Üst Başlık ve Proje Seçici */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <Activity size={22} />
            </div>
            Pulse / <span className="text-blue-600">{selectedProject?.title || "Proje Seçin"}</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ml-12">Haftalık Takım Nabzı</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <Layout size={18} className="text-gray-400 ml-3" />
          <select 
            value={selectedProject?.id}
            onChange={(e) => {
              const p = projects.find(proj => proj.id.toString() === e.target.value);
              if (p) setSelectedProject(p);
            }}
            className="bg-transparent border-none text-gray-700 dark:text-gray-200 py-2 pr-10 pl-2 outline-none font-bold text-sm cursor-pointer"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* SOL SÜTUN: Ekip Listesi ve Haftanın Nabzı */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex justify-between items-center">
              Ekip Üyeleri <span>{membersData.length}</span>
            </h3>
            <div className="space-y-5">
              {membersData.map((user) => (
                <div key={user.id} className="flex items-center gap-4 group cursor-default">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-black text-blue-600 border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{user.done} Görev Tamamlandı</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl shadow-blue-200 dark:shadow-none text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Haftanın Toplamı</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black">{totalCompleted}</span>
                <span className="text-blue-100 text-sm font-bold uppercase">Görev</span>
              </div>
              <p className="mt-4 text-xs text-blue-100/70 font-medium">Bu hafta ekip ivmesi %12 arttı</p>
            </div>
            <Zap className="absolute -bottom-6 -right-6 text-white/10 w-40 h-40 group-hover:rotate-12 transition-transform duration-500" />
          </div>
        </div>

        {/* SAĞ SÜTUN: Grafik ve Performans Kartları */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-2">
              <Award className="text-amber-500" size={22} /> En Aktif Kullanıcılar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {membersData.slice(0, 4).map((user) => (
                <div key={user.id} className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-black text-gray-800 dark:text-white uppercase italic">{user.name}</span>
                    <span className="text-xl font-black text-blue-600">%{user.score}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${user.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-500" size={22} /> Aktivite Grafiği
            </h3>
            <div className="h-48 flex items-end justify-between gap-2 px-4 border-b border-gray-100 dark:border-gray-800 pb-2">
              {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
                <div key={i} className="flex-grow flex flex-col items-center group">
                  <div 
                    className="w-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-600 transition-all duration-500 rounded-t-lg" 
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-[9px] font-bold text-gray-400 mt-2 uppercase">G{i+1}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase tracking-widest">Son 7 Günlük Görev Dağılımı</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Pulse;