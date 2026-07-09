import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  Users, 
  FolderKanban, 
  UserPlus, 
  ArrowLeft,
  Calendar,
  X,
  UserMinus,
  LogOut,
  ChevronRight,
  Trash2,
  Lock,
  FileText          // 👈 Belgeler ikonu için eklendi
} from "lucide-react";

// DocumentsTab bileşenini proje yapınıza göre doğru yoldan import edin
import DocumentsTab from "./Documentstab";   // 👈 Dosyanın yolu değişebilir

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId;
  } catch (e) {
    return null;
  }
};

const OrganizationDetail = () => {
  const { orgId } = useParams();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const currentUserId = getUserIdFromToken();

  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "projects" | "documents">("members"); // 👈 documents eklendi

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [orgId]);

  useEffect(() => {
    if (activeTab === "projects") {
      fetchOrgProjects();
    }
  }, [activeTab, orgId]);

  const fetchMembers = async () => {
    if (!orgId || orgId === "undefined") return;
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}/members`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMembers(data);
      else setMembers([]);
    } catch (error) {
      console.error("Üyeler yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrgProjects = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsProjectsLoading(true);
      const res = await fetch(`http://localhost:5000/api/project/org/${orgId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProjects(data);
    } catch (error) {
      console.error("Projeler yüklenemedi:", error);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail, orgId: orgId })
      });
      if (res.ok) {
        alert("Davet başarıyla gönderildi!");
        setIsInviteModalOpen(false);
        setInviteEmail("");
      }
    } catch (error) {
      alert("Sunucu bağlantı hatası.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm("Üyeyi çıkarmak istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}/delete-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ memberId })
      });
      if (res.ok) fetchMembers();
    } catch (error) { console.error(error); }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Ekipten ayrılmak istiyor musunuz?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}/leave`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) navigate("/team");
    } catch (error) { console.error(error); }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Projeyi silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/project/${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteTeam = async () => {

    console.log("Silinecek orgId:", orgId);
  console.log("localStorage orgProjects:", localStorage.getItem("orgProjects"));


    if (!window.confirm("Bu ekibi tamamen kapatmak istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/organizations/${orgId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        // localStorage'dan bu org'u kaldır → Raporlar listesi otomatik güncellenir
        const existing = JSON.parse(localStorage.getItem("orgProjects") || "{}");
        delete existing[orgId!];
        localStorage.setItem("orgProjects", JSON.stringify(existing));

        // Sidebar ve Raporlar listesini güncelle
        window.dispatchEvent(new CustomEvent("teams-updated"));

        navigate("/team");
      }
    } catch (error) { console.error(error); }
  };

  const handleProjectClick = (project: any) => {
    const isOwner = project.ownerId === currentUserId;
    const isMember = project.members?.some((m: any) => m.userId === currentUserId);

    if (isOwner || isMember) {
      navigate(`/projects/${project.id}`);
    } else {
      alert("Bu projenin panosuna erişim yetkiniz yok.");
    }
  };

  return (
    <div className={`min-h-screen p-8 transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* DAVET MODALI */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Ekibe Davet Et</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleInvite} className="space-y-6">
              <input type="email" required placeholder="arkadas@sirket.com" className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-bold ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>İptal</button>
                <button type="submit" disabled={isInviting} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">{isInviting ? "..." : "Davet Et"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ÜST BAR */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <button onClick={() => navigate("/team")} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity font-bold">
          <ArrowLeft size={20} /> Organizasyonlara Dön
        </button>
        <div className="flex gap-3">
          <button onClick={handleLeaveTeam} className="bg-red-500/10 text-red-500 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={18} /> Ekipten Ayrıl
          </button>

          <button onClick={handleDeleteTeam} className="bg-red-500/10 text-red-500 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
            <Trash2 size={18} /> Ekibi Kapat
          </button>

          <button onClick={() => setIsInviteModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95">
            <UserPlus size={18} /> Üye Davet Et
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Çalışma Alanı Detayları</h1>

        {/* TAB MENÜ */}
        <div className="flex gap-8 border-b border-gray-700/20 mb-8">
          <button onClick={() => setActiveTab("members")} className={`pb-4 font-bold flex items-center gap-2 transition-all ${activeTab === "members" ? 'border-b-2 border-blue-500 text-blue-500' : 'opacity-50 hover:opacity-80'}`}>
            <Users size={20} /> Üyeler ({members.length})
          </button>
          <button onClick={() => setActiveTab("projects")} className={`pb-4 font-bold flex items-center gap-2 transition-all ${activeTab === "projects" ? 'border-b-2 border-blue-500 text-blue-500' : 'opacity-50 hover:opacity-80'}`}>
            <FolderKanban size={20} /> Projeler
          </button>
          {/* 👇 Yeni Belgeler sekmesi */}
          <button onClick={() => setActiveTab("documents")} className={`pb-4 font-bold flex items-center gap-2 transition-all ${activeTab === "documents" ? 'border-b-2 border-blue-500 text-blue-500' : 'opacity-50 hover:opacity-80'}`}>
            <FileText size={20} /> Belgeler
          </button>
        </div>

        {/* İÇERİK LİSTESİ */}
        {activeTab === "members" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? <div className="col-span-full text-center font-bold opacity-50">Yükleniyor...</div> : members.map((member) => (
              <div key={member.id} className={`p-6 rounded-3xl border transition-all relative group ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                {member.role !== 'OWNER' && (
                  <button onClick={() => handleDeleteMember(member.id)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><UserMinus size={18} /></button>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white uppercase">{member.name.charAt(0)}</div>
                  <div><h3 className="font-bold">{member.name}</h3><p className="text-xs opacity-60 truncate w-40">{member.email}</p></div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${member.role === 'OWNER' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>{member.role}</span>
              </div>
            ))}
          </div>
        ) : activeTab === "projects" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isProjectsLoading ? <div className="col-span-full text-center font-bold opacity-50">Projeler yükleniyor...</div> : projects.map((project) => {
              
              const isOwner = project.ownerId === currentUserId;
              const isMember = project.members?.some((m: any) => m.userId === currentUserId);
              const hasAccess = isOwner || isMember;

              return (
                <div 
                  key={project.id} 
                  onClick={() => handleProjectClick(project)} 
                  className={`group p-8 rounded-[2.5rem] border transition-all relative shadow-sm 
                    ${hasAccess ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-2' : 'cursor-not-allowed opacity-60 grayscale-[0.3]'} 
                    ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  {isOwner && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 z-10"><Trash2 size={18} /></button>
                  )}

                  <div className="flex justify-between items-start mb-8">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${!hasAccess ? 'bg-gray-200 text-gray-400' : darkMode ? 'bg-slate-700 group-hover:bg-blue-600 text-white' : 'bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-500'}`}>
                      {hasAccess ? <FolderKanban size={24} /> : <Lock size={24} />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${hasAccess ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 bg-gray-200'}`}>
                        {project._count?.tasks || 0} Görev
                      </span>
                    </div>
                  </div>
                  
                  <h4 className={`text-xl font-black mb-3 transition-colors ${hasAccess && 'group-hover:text-blue-500'}`}>{project.title}</h4>
                  <p className="text-sm opacity-60 font-medium line-clamp-2 h-10 mb-8">{project.description || "Açıklama bulunmuyor."}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-700/10">
                    <div className="flex items-center gap-2 text-[10px] font-bold opacity-40"><Calendar size={14} /> {new Date(project.createdAt).toLocaleDateString("tr-TR")}</div>
                    
                    {hasAccess ? (
                      <div className="flex items-center gap-1 text-blue-500 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">Panoya Git <ChevronRight size={16} /></div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400 font-bold text-[10px] uppercase tracking-widest"><Lock size={12}/> Erişim Yok</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 👇 Belgeler sekmesi – DocumentsTab bileşeni render ediliyor
          <DocumentsTab orgId={orgId} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default OrganizationDetail;