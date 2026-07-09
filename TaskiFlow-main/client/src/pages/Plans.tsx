import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  Check, Star, Shield, Zap, 
  Facebook, Twitter, Instagram, Linkedin 
} from "lucide-react";
import Logo from "../components/Logo";

const Plans = () => {
  const { darkMode } = useTheme();

  // Ödeme Başlatma Fonksiyonu
  const handleCheckout = (planName: string, price: number) => {
    // Ödeme sayfasına yönlendir
    window.location.href = `/payment?plan=${encodeURIComponent(planName)}&price=${price}`;
  };

  const plans = [
    {
      name: "Başlangıç",
      price: 0,
      displayPrice: "₺0",
      period: "/ay",
      desc: "Bireysel kullanım ve küçük projeler için ideal.",
      features: ["Sınırsız Görev", "2 Proje", "50 MB Depolama", "Temel Destek"],
      buttonText: "Ücretsiz Başla",
      isPopular: false,
      color: "border-gray-200",
      btnColor: "bg-gray-100 text-gray-700 hover:bg-gray-200"
    },
    {
      name: "Profesyonel",
      price: 99,
      displayPrice: "₺99",
      period: "/ay",
      desc: "Büyüyen ekipler ve ciddi işler için güç.",
      features: ["Sınırsız Proje", "Sınırsız Ekip Üyesi", "10 GB Depolama", "Gelişmiş Raporlar", "Öncelikli Destek"],
      buttonText: "Hemen Satın Al",
      isPopular: true,
      color: "border-blue-500",
      btnColor: "bg-blue-600 text-white hover:bg-blue-700"
    },
    {
      name: "Şirketler",
      price: 0, // Özel fiyatlandırma için 0 kullanıyoruz
      displayPrice: "Özel",
      period: "",
      desc: "Büyük organizasyonlar için tam kontrol.",
      features: ["Sınırsız Her Şey", "Özel Sunucu", "SLA Garantisi", "7/24 Canlı Destek", "Yönetici Paneli"],
      buttonText: "İletişime Geç",
      isPopular: false,
      color: "border-purple-500",
      btnColor: "bg-purple-600 text-white hover:bg-purple-700",
      isContact: true // İletişim sayfasına yönlendirme için flag
    }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* ================= NAVBAR ================= */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-blue-100'}`}>
        <div className="transform scale-75 origin-left"><Logo /></div>

        <div className={`hidden md:flex gap-8 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Link to="/features" className="hover:text-blue-600 transition-colors">ÖZELLİKLER</Link>
          <Link to="/solutions" className="hover:text-blue-600 transition-colors">ÇÖZÜMLER</Link>
          <Link to="/plans" className="text-blue-600 font-bold">FİYATLAR</Link> {/* Aktif Sayfa */}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className={`text-sm font-bold transition-colors ${darkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}>Giriş Yap</Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">Ücretsiz Edin</Link>
        </div>
      </nav>

      {/* ================= HEADER ================= */}
      <div className="pt-40 pb-12 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Planınızı Seçin</h1>
        <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Şeffaf fiyatlandırma. Gizli ücret yok. İstediğiniz zaman iptal edin veya paketinizi değiştirin.
        </p>
      </div>

      {/* ================= PLANLAR (KARTLAR) ================= */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {plans.map((plan, index) => (
          <div key={index} className={`relative p-8 rounded-3xl border-2 transition-transform duration-300 hover:-translate-y-2 flex flex-col h-full
            ${plan.isPopular ? `shadow-2xl scale-105 z-10 ${darkMode ? 'bg-gray-800 border-blue-500' : 'bg-white border-blue-500'}` 
                             : `shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          `}>
            
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Star size={12} fill="white"/> En Popüler
              </div>
            )}

            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
            <div className="flex items-baseline mb-4">
              <span className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{plan.displayPrice}</span>
              <span className={`ml-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
            </div>
            <p className={`text-sm mb-8 h-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.isPopular ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    <Check size={12} strokeWidth={4}/>
                  </div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.isContact ? (
              <Link 
                to="/contact" 
                className={`block w-full py-3.5 rounded-xl font-bold text-center transition-colors shadow-sm hover:scale-[1.02] ${plan.btnColor}`}
              >
                {plan.buttonText}
              </Link>
            ) : plan.price > 0 ? (
              <button 
                onClick={() => handleCheckout(plan.name, plan.price)}
                className={`w-full py-3.5 rounded-xl font-bold text-center transition-colors shadow-sm hover:scale-[1.02] ${plan.btnColor}`}
              >
                {plan.buttonText}
              </button>
            ) : (
              <Link to="/register" className={`block w-full py-3.5 rounded-xl font-bold text-center transition-colors shadow-sm hover:scale-[1.02] ${plan.btnColor}`}>
                {plan.buttonText}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* ================= GÜVENLİK BADGE'LERİ ================= */}
      <div className={`border-t py-12 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-around items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <Shield size={32} className="text-green-500"/>
            <h4 className="font-bold">256-bit SSL</h4>
            <p className="text-xs text-gray-500">Bankacılık düzeyinde şifreleme</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Zap size={32} className="text-yellow-500"/>
            <h4 className="font-bold">Anında Aktivasyon</h4>
            <p className="text-xs text-gray-500">Ödemeden hemen sonra başlayın</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Check size={32} className="text-blue-500"/>
            <h4 className="font-bold">İade Garantisi</h4>
            <p className="text-xs text-gray-500">14 gün içinde koşulsuz iade</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Plans;