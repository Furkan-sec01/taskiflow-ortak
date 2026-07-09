import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, BookOpen, HelpCircle, MessageCircle, FileText } from "lucide-react";

const Resources = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex justify-between ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-100'}`}>
        <Link to="/" className="flex items-center gap-2 font-bold text-xl"><div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">T</div>TaskiFlow</Link>
        <Link to="/" className="text-sm font-bold hover:text-blue-600 flex items-center gap-2"><ArrowLeft size={16}/> Ana Sayfaya Dön</Link>
      </nav>

      <section className="pt-40 pb-16 text-center px-6">
        <h1 className="text-5xl font-extrabold mb-6">Bilgi ve <span className="text-yellow-500">Kaynaklar</span></h1>
        <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>TaskiFlow'u en verimli şekilde kullanmanız için rehberler, ipuçları ve topluluk.</p>
      </section>

      <section className="px-6 pb-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Help Center */}
        <div className={`p-8 rounded-3xl border flex items-start gap-6 hover:shadow-lg transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><HelpCircle size={28}/></div>
          <div>
            <h3 className="text-xl font-bold mb-2">Yardım Merkezi</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sıkça sorulan sorular, kurulum rehberleri ve hesap yönetimi hakkında bilgiler.</p>
            <a href="#" className="text-blue-600 font-bold hover:underline">Rehbere Git →</a>
          </div>
        </div>

        {/* Blog */}
        <div className={`p-8 rounded-3xl border flex items-start gap-6 hover:shadow-lg transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="h-14 w-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0"><FileText size={28}/></div>
          <div>
            <h3 className="text-xl font-bold mb-2">Blog</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Üretkenlik ipuçları, uzaktan çalışma tüyoları ve TaskiFlow güncellemeleri.</p>
            <a href="#" className="text-purple-600 font-bold hover:underline">Yazıları Oku →</a>
          </div>
        </div>

        {/* Community */}
        <div className={`p-8 rounded-3xl border flex items-start gap-6 hover:shadow-lg transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0"><MessageCircle size={28}/></div>
          <div>
            <h3 className="text-xl font-bold mb-2">Topluluk</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Diğer kullanıcılarla tanışın, fikir alışverişinde bulunun ve özellik önerin.</p>
            <a href="#" className="text-green-600 font-bold hover:underline">Katıl →</a>
          </div>
        </div>

        {/* API Docs */}
        <div className={`p-8 rounded-3xl border flex items-start gap-6 hover:shadow-lg transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="h-14 w-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0"><BookOpen size={28}/></div>
          <div>
            <h3 className="text-xl font-bold mb-2">Geliştirici API</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>TaskiFlow'u kendi araçlarınızla entegre etmek için API dokümantasyonu.</p>
            <a href="#" className="text-orange-600 font-bold hover:underline">Dökümanı İncele →</a>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Resources;