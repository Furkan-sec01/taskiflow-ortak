import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  Users, 
  Plus, 
  Trash2,
  ArrowRightCircle,
  X
} from "lucide-react";
import NotificationDropdown from "../components/NotificationDropdown";

const Team = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyOrganizations();
  }, []);

  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener("open-create-team-modal", handler);
    return () => window.removeEventListener("open-create-team-modal", handler);
  }, []);

  const fetchMyOrganizations = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrganizations(data.myOrganizations || []);
      }
    } catch (err) {
      setError("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    const token = localStorage.getItem("token");
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/organizations/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newOrgName })
      });

      const data = await res.json();

      console.log("Backend response:", data);

      if (res.ok) {
        // Yeni organizasyonu Reports sayfası için localStorage'a kaydet
        const orgId = data.organization?.id || data.id || data._id;
        if (orgId) {
          const existingProjects = JSON.parse(localStorage.getItem("orgProjects") || "{}");
          existingProjects[orgId] = {
            name: newOrgName,
            sprint: "Sprint 1"
          };
          localStorage.setItem("orgProjects", JSON.stringify(existingProjects));
        }

        // Sidebar'ı yenile
        window.dispatchEvent(new CustomEvent("teams-updated"));

        setIsModalOpen(false);
        setNewOrgName("");
        fetchMyOrganizations();
      }

    } catch (err) {
      alert("Sunucu hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchOrg = (orgId: string) => {
    localStorage.setItem("activeOrgId", orgId);
    navigate(`/teams/${orgId}`); 
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F3F4F6] text-gray-800'}`}>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl transform transition-all ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Yeni Çalışma Alanı</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Organizasyon Adı</label>
                <input 
                  type="text"
                  required
                  placeholder="Örn: Yazılım Ekibi, Tasarım Ajansı..."
                  className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-4 rounded-2xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                >
                  {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Organizasyonlarım</h1>
            <p className="text-gray-500 mt-1">Dahil olduğun gerçek çalışma alanları.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={20}/> Yeni Organizasyon
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-2xl border border-red-200">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full text-center py-20 animate-pulse">Veritabanından organizasyonlar getiriliyor...</div>
          ) : organizations.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 border-2 border-dashed border-gray-700 rounded-3xl">
              Henüz hiçbir organizasyona bağlı değilsiniz.
            </div>
          ) : (
            organizations.map((membership) => (
              <div 
                key={membership.id} 
                className={`group p-6 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
              >
                <div className={`h-14 w-14 rounded-2xl mb-6 flex items-center justify-center text-2xl font-bold shadow-inner
                  ${membership.role === 'OWNER' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                  {membership.name?.charAt(0).toUpperCase() || "W"}
                </div>

                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{membership.name}</h3>
                
                <div className="flex items-center gap-4 mb-8">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                    ${membership.role === 'OWNER' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                    {membership.role}
                  </span>
                </div>

                <button 
                  onClick={() => handleSwitchOrg(membership.id)}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all
                    ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700'}`}
                >
                  Çalışma Alanına Git <ArrowRightCircle size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Team;