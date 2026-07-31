import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { CheckCircle, ArrowRight, Download, Mail, Loader2 } from "lucide-react";
import Logo from "../components/Logo";

const API_BASE = "http://localhost:5000";

const PLAN_LABELS: Record<string, string> = {
  FREE: "Ücretsiz",
  PRO: "Profesyonel",
  BUSINESS: "Kurumsal",
};

const PaymentSuccess = () => {
  const { darkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL parametreleri sadece backend'den veri gelene kadar geçici fallback
  const fallbackPlanName = searchParams.get("plan") || "Profesyonel";
  const fallbackPrice = searchParams.get("price") || "99";

  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState(fallbackPlanName);
  const [price, setPrice] = useState(fallbackPrice);

  useEffect(() => {
    const fetchOverview = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/payments/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Fatura bilgileri alınamadı.");

        const plan = data.subscription?.plan;
        if (plan) setPlanName(PLAN_LABELS[plan] || plan);

        const lastPayment = data.payments?.[0];
        if (lastPayment?.amount != null) setPrice(String(lastPayment.amount));
      } catch (err) {
        console.error("Billing overview çekilemedi, URL parametreleri gösteriliyor:", err);
        // sessizce fallback (URL parametreleri) ile devam ediyoruz
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-blue-100'}`}>
        <div className="transform scale-75 origin-left"><Logo /></div>
        <Link to="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          Dashboard'a Git
          <ArrowRight size={20} />
        </Link>
      </nav>

      {/* İÇERİK */}
      <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center">
        
        {/* Başarı İkonu */}
        <div className="mb-8 flex justify-center">
          <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle size={48} />
          </div>
        </div>

        {/* Başlık */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Ödeme Başarılı! 🎉</h1>
        <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {planName} planınız başarıyla aktifleştirildi.
        </p>

        {/* Özet Kart */}
        <div className={`p-8 rounded-3xl shadow-xl mb-8 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              Fatura bilgileri getiriliyor...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Plan</span>
                <span className="font-bold text-lg">{planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Ödenen Tutar</span>
                <span className="font-bold text-2xl text-blue-600">{price}₺</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Durum</span>
                <span className="font-bold text-green-600">Aktif</span>
              </div>
            </div>
          )}
        </div>

        {/* Bilgilendirme */}
        <div className={`p-6 rounded-2xl mb-8 ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-start gap-3 text-left">
            <Mail size={20} className="text-blue-600 mt-1" />
            <div>
              <h3 className="font-bold mb-2">Fatura E-postanıza Gönderildi</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Ödeme onayı ve fatura detayları e-posta adresinize gönderilmiştir.
              </p>
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            Dashboard'a Git
            <ArrowRight size={20} />
          </Link>
          <button
            onClick={() => window.print()}
            className={`px-8 py-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
              darkMode 
                ? 'border-gray-700 text-white hover:bg-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Download size={20} />
            Faturayı İndir
          </button>
        </div>

        {/* Yardım */}
        <div className="mt-12">
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Sorularınız mı var? <Link to="/contact" className="text-blue-600 hover:underline">Bizimle iletişime geçin</Link>
          </p>
        </div>

      </div>

    </div>
  );
};

export default PaymentSuccess;





