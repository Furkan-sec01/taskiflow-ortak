import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import Logo from "../components/Logo";

const Verify = () => {
  const { darkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "input">(tokenFromUrl ? "loading" : "input");
  const [message, setMessage] = useState("");
  const [manualToken, setManualToken] = useState("");

  const verifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify) {
      setStatus("error");
      setMessage("Token gereklidir. Lütfen onaylama linkini kontrol edin.");
      return;
    }

    try {
      // Backend URL'lerini dene (localhost ve 127.0.0.1)
      const backendUrls = [
        "http://localhost:5000/api/verify",
        "http://127.0.0.1:5000/api/verify"
      ];

      let lastError: any = null;
      let success = false;

      for (const url of backendUrls) {
        try {
          // Timeout için AbortController kullan
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye

          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenToVerify }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: "Sunucu hatası" }));
            throw new Error(errorData.error || `HTTP ${res.status}`);
          }

          const data = await res.json();

          if (data.success) {
            setStatus("success");
            setMessage(data.message || "Hesabınız başarıyla aktifleştirildi!");
            
            // 2 saniye sonra ekip yönetimi sayfasına yönlendir
            setTimeout(() => {
              navigate("/team");
            }, 2000);
            success = true;
            break;
          } else {
            setStatus("error");
            setMessage(data.error || "Onaylama işlemi başarısız oldu.");
            success = true; // Hata mesajı aldık, döngüden çık
            break;
          }
        } catch (fetchError: any) {
          lastError = fetchError;
          // İlk URL başarısız oldu, diğerini dene
          if (url === backendUrls[0]) continue;
        }
      }

      // Hiçbir URL çalışmadıysa
      if (!success && lastError) {
        throw lastError;
      }
    } catch (error: any) {
      console.error("Onaylama hatası:", error);
      setStatus("error");
      
      // Daha açıklayıcı hata mesajları
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        setMessage("İstek zaman aşımına uğradı. Backend sunucusunun çalıştığından emin olun.");
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        setMessage("Sunucuya bağlanılamadı. Lütfen backend sunucusunun çalıştığından emin olun (http://localhost:5000).");
      } else if (error.message) {
        setMessage(`Hata: ${error.message}`);
      } else {
        setMessage("Sunucuya bağlanılamadı. Lütfen backend sunucusunun çalıştığından emin olun.");
      }
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      setStatus("loading");
      verifyToken(tokenFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="transform scale-75">
            <Logo />
          </div>
        </div>

        {/* İçerik Kartı */}
        <div className={`p-8 rounded-3xl shadow-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          
          {status === "loading" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Loader size={64} className="text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Hesap Onaylanıyor...</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Lütfen bekleyin, hesabınız aktifleştiriliyor.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-green-600">Başarılı! 🎉</h1>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {message}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Ekip Yönetimi sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          {status === "input" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader size={48} className="text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Hesap Onaylama</h1>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Email'den link açılmadıysa, onaylama token'ınızı buraya girin:
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Onaylama token'ınızı buraya yapıştırın"
                  className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
                <button
                  onClick={() => {
                    setStatus("loading");
                    verifyToken(manualToken);
                  }}
                  disabled={!manualToken.trim()}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Onayla
                </button>
                <button
                  onClick={() => navigate("/team")}
                  className={`w-full px-6 py-3 rounded-xl font-bold transition-all ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle size={48} className="text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-red-600">Hata Oluştu</h1>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {message}
              </p>
              
              {/* Backend kontrolü için bilgi */}
              {message.includes("bağlanılamadı") && (
                <div className={`mb-6 p-4 rounded-xl text-left text-sm ${darkMode ? 'bg-gray-700/50' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <p className={`font-semibold mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                    ⚠️ Backend Sunucusu Kontrolü:
                  </p>
                  <ol className={`list-decimal list-inside space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>Backend sunucusunun çalıştığından emin olun</li>
                    <li>Terminal'de <code className="bg-gray-800 text-green-400 px-1 rounded">cd server && npm start</code> komutunu çalıştırın</li>
                    <li>Sunucunun <code className="bg-gray-800 text-green-400 px-1 rounded">http://localhost:5000</code> adresinde çalıştığını kontrol edin</li>
                  </ol>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStatus("input");
                    setManualToken("");
                  }}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Token'ı Manuel Gir
                </button>
                <button
                  onClick={() => {
                    if (tokenFromUrl) {
                      setStatus("loading");
                      verifyToken(tokenFromUrl);
                    } else {
                      setStatus("input");
                    }
                  }}
                  className={`w-full px-6 py-3 rounded-xl font-bold transition-all ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tekrar Dene
                </button>
                <button
                  onClick={() => navigate("/team")}
                  className={`w-full px-6 py-3 rounded-xl font-bold transition-all ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Ekip Yönetimine Dön
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Verify;

