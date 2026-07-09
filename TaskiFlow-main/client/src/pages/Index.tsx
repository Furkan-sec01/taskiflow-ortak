import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  LayoutDashboard, ArrowRight, CheckCircle, Play, 
  Facebook, Twitter, Instagram, Linkedin 
} from "lucide-react";

import Logo from "../components/Logo";

const Index = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      
      {/* ================= NAVBAR ================= */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-blue-100'}`}>
        {/* Sol Logo */}
        <div className="transform scale-75 origin-left"><Logo /></div>

        {/* LİNKLER */}
        <div className={`hidden md:flex gap-8 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Link to="/features" className="hover:text-blue-600 transition-colors">ÖZELLİKLER</Link>
          <Link to="/solutions" className="hover:text-blue-600 transition-colors">ÇÖZÜMLER</Link>
          <Link to="/plans" className="hover:text-blue-600 transition-colors">FİYATLAR</Link>
        </div>

        {/* Sağ Butonlar */}
        <div className="flex items-center gap-4">
          <Link to="/login" className={`text-sm font-bold transition-colors ${darkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}>Giriş Yap</Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">Ücretsiz Edin</Link>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            İşlerinizi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">TaskiFlow</span> ile düzene sokun.
          </h1>
          <p className={`text-xl leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Projelerinizi, görevlerinizi ve ekibinizi tek bir yerden, en verimli şekilde yönetin. Karmaşaya son verin, başarıya odaklanın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="email" placeholder="E-posta adresiniz..." className={`flex-1 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 shadow-inner'}`} />
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group">
              Ücretsiz Başla <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> Kredi kartı gerekmez</span>
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> 14 gün ücretsiz deneme</span>
          </div>
        </div>
        <div className="relative mt-10 lg:mt-0">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className={`relative rounded-3xl border p-4 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 ${darkMode ? 'bg-gray-800 border-gray-700 shadow-black/50' : 'bg-white border-gray-200 shadow-xl'}`}>
            <div className={`flex items-center justify-between mb-6 p-3 border-b border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
              <div className={`h-2 w-20 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl flex items-center justify-between ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><LayoutDashboard size={20}/></div><div><div className={`h-2.5 w-24 rounded-full mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div><div className={`h-2 w-16 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div></div></div>
              </div>
              <div className={`p-4 rounded-xl flex items-center justify-between ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><LayoutDashboard size={20}/></div><div><div className={`h-2.5 w-32 rounded-full mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div><div className={`h-2 w-20 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div></div></div>
              </div>
            </div>
            <div className={`absolute -bottom-6 -left-6 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-bounce ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white"><CheckCircle size={20}/></div>
              <div><p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Görev Tamamlandı</p><p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Proje Lansmanı 🚀</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PARTNERS ================= */}
      <section className={`py-12 border-y ${darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 lg:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
          <span className="text-2xl font-bold flex items-center gap-2 hover:text-blue-500"><Play size={28}/> Google</span>
          <span className="text-2xl font-bold flex items-center gap-2 hover:text-blue-600"><LayoutDashboard size={28}/> Microsoft</span>
          <span className="text-2xl font-bold flex items-center gap-2 hover:text-orange-500"><ArrowRight size={28}/> Amazon</span>
        </div>
      </section>

    </div>
  );
};

export default Index;