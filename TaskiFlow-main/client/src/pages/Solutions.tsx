import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  Code, Megaphone, Briefcase, 
  Facebook, Twitter, Instagram, Linkedin 
} from "lucide-react";
import Logo from "../components/Logo";

const Solutions = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      
      {/* ================= NAVBAR ================= */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-blue-100'}`}>
        {/* Sol Logo */}
        <div className="transform scale-75 origin-left"><Logo /></div>

        {/* Orta Linkler */}
        <div className={`hidden md:flex gap-8 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Link to="/features" className="hover:text-blue-600 transition-colors">ÖZELLİKLER</Link>
          <Link to="/solutions" className="text-blue-600 font-bold">ÇÖZÜMLER</Link> {/* Aktif Sayfa */}
          <Link to="/plans" className="hover:text-blue-600 transition-colors">FİYATLAR</Link>
        </div>

        {/* Sağ Butonlar */}
        <div className="flex items-center gap-4">
          <Link to="/login" className={`text-sm font-bold transition-colors ${darkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}>Giriş Yap</Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">Ücretsiz Edin</Link>
        </div>
      </nav>

      {/* ================= HEADER ================= */}
      <section className="pt-40 pb-16 text-center px-6">
        <h1 className="text-5xl font-extrabold mb-6">Her Ekip İçin <span className="text-purple-600">Mükemmel Çözüm</span></h1>
        <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Sektörünüz ne olursa olsun, TaskiFlow iş akışınıza uyum sağlar.
        </p>
      </section>

      {/* ================= İÇERİK (Grid) ================= */}
      <section className="px-6 pb-24 max-w-7xl mx-auto space-y-20">
        
        {/* 1. Pazarlama */}
        <div className={`flex flex-col md:flex-row items-center gap-12 p-10 rounded-3xl transition-all hover:shadow-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-purple-50 shadow-lg'}`}>
          <div className="flex-1 space-y-4">
            <div className="h-14 w-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Megaphone size={28} />
            </div>
            <h2 className="text-3xl font-bold">Pazarlama Ekipleri</h2>
            <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Kampanyaları planlayın, içerik takvimini yönetin ve kreatif süreçleri tek bir yerden takip edin. Artık son dakika sürprizlerine yer yok.
            </p>
          </div>
          <div className="flex-1 h-64 w-full rounded-2xl shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-105">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80" 
              alt="Pazarlama ekibi çalışması" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>

        {/* 2. Yazılım (Ters Yön) */}
        <div className={`flex flex-col md:flex-row-reverse items-center gap-12 p-10 rounded-3xl transition-all hover:shadow-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 shadow-lg'}`}>
          <div className="flex-1 space-y-4">
            <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Code size={28} />
            </div>
            <h2 className="text-3xl font-bold">Yazılım Geliştirme</h2>
            <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Bug takibi, Sprint planlaması ve özellik geliştirme süreçleri. Agile ve Scrum metodolojilerine tam uyumlu yapı ile kodunuzu hızlandırın.
            </p>
          </div>
          <div className="flex-1 h-64 w-full rounded-2xl shadow-xl overflow-hidden transform -rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-105">
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&q=80" 
              alt="Yazılım geliştirme" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>

        {/* 3. İnsan Kaynakları */}
        <div className={`flex flex-col md:flex-row items-center gap-12 p-10 rounded-3xl transition-all hover:shadow-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-orange-50 shadow-lg'}`}>
          <div className="flex-1 space-y-4">
            <div className="h-14 w-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Briefcase size={28} />
            </div>
            <h2 className="text-3xl font-bold">İnsan Kaynakları</h2>
            <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              İşe alım süreçlerini, aday havuzunu ve oryantasyon programlarını organize edin. Şeffaf, düzenli ve insan odaklı bir İK süreci yönetin.
            </p>
          </div>
          <div className="flex-1 h-64 w-full rounded-2xl shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-105">
            <img 
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop&q=80" 
              alt="İnsan kaynakları ve ekip yönetimi" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>

      </section>

    </div>
  );
};

export default Solutions;