import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  LayoutDashboard, CheckSquare, Zap, Users, Shield, Globe, 
  Facebook, Twitter, Instagram, Linkedin 
} from "lucide-react";
import Logo from "../components/Logo";

const Features = () => {
  const { darkMode } = useTheme();

  const features = [
    { icon: <LayoutDashboard size={32}/>, title: "Görsel Panolar", desc: "İş akışınızı Kanban panoları ile görselleştirin. Sürükle-bırak yaparak işleri kolayca yönetin." },
    { icon: <CheckSquare size={32}/>, title: "Gelişmiş Görevler", desc: "Alt görevler, son tarihler ve öncelik seviyeleri ile hiçbir detayı kaçırmayın." },
    { icon: <Zap size={32}/>, title: "Otomasyon", desc: "Tekrarlayan işleri otomatiğe bağlayın. Kod bilmenize gerek yok." },
    { icon: <Users size={32}/>, title: "Ekip İşbirliği", desc: "Gerçek zamanlı yorumlar ve etiketlemeler ile ekibinizle senkronize kalın." },
    { icon: <Shield size={32}/>, title: "Kurumsal Güvenlik", desc: "Verileriniz 256-bit şifreleme ile güvende. Yedekleme derdi yok." },
    { icon: <Globe size={32}/>, title: "Her Yerden Erişim", desc: "Mobil, tablet veya masaüstü. TaskiFlow her cihazda yanınızda." },
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      
      {/* ================= NAVBAR ================= */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-blue-100'}`}>
        <div className="transform scale-75 origin-left"><Logo /></div>

        <div className={`hidden md:flex gap-8 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Link to="/features" className="text-blue-600 font-bold">ÖZELLİKLER</Link> {/* Aktif Sayfa */}
          <Link to="/solutions" className="hover:text-blue-600 transition-colors">ÇÖZÜMLER</Link>
          <Link to="/plans" className="hover:text-blue-600 transition-colors">FİYATLAR</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className={`text-sm font-bold transition-colors ${darkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}>Giriş Yap</Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">Ücretsiz Edin</Link>
        </div>
      </nav>

      {/* ================= HEADER ================= */}
      <section className="pt-40 pb-20 text-center px-6">
        <h1 className="text-5xl font-extrabold mb-6">Sınırları Zorlayan <span className="text-blue-600">Özellikler</span></h1>
        <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          TaskiFlow, sadece bir yapılacaklar listesi değil. İşinizi büyütmek için ihtiyacınız olan her şey.
        </p>
      </section>

      {/* ================= GRID (ÖZELLİKLER) ================= */}
      <section className="px-6 pb-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className={`p-8 rounded-3xl border transition-all hover:-translate-y-2 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700 hover:shadow-blue-900/20' : 'bg-gray-50 border-gray-100 hover:shadow-blue-200'}`}>
            <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">{f.icon}</div>
            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{f.desc}</p>
          </div>
        ))}
      </section>

    </div>
  );
};

export default Features;