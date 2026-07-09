import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { CreditCard, Lock, CheckCircle, ArrowLeft, Shield, AlertCircle } from "lucide-react";
import Logo from "../components/Logo";

const Payment = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const planName = searchParams.get("plan") || "Profesyonel";
  const price = parseInt(searchParams.get("price") || "99");

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    email: "",
    address: "",
    city: "",
    zipCode: ""
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Eğer plan ve fiyat yoksa ana sayfaya yönlendir
    if (!searchParams.get("plan") || !searchParams.get("price")) {
      navigate("/plans");
    }
  }, [searchParams, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Kart numarası formatı (16 haneli, 4'er 4'er)
    if (name === "cardNumber") {
      const formatted = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
      if (formatted.replace(/\s/g, "").length <= 16) {
        setFormData({ ...formData, [name]: formatted });
      }
    }
    // Son kullanma tarihi formatı (MM/YY)
    else if (name === "expiryDate") {
      const formatted = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
      if (formatted.length <= 5) {
        setFormData({ ...formData, [name]: formatted });
      }
    }
    // CVV formatı (3 haneli)
    else if (name === "cvv") {
      if (value.length <= 3 && /^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    }
    // Posta kodu formatı (5 haneli)
    else if (name === "zipCode") {
      if (value.length <= 5 && /^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Geçerli bir kart numarası girin (16 haneli)";
    }

    if (!formData.cardName || formData.cardName.length < 3) {
      newErrors.cardName = "Kart üzerindeki ismi girin";
    }

    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      newErrors.expiryDate = "Son kullanma tarihi girin (MM/YY)";
    }

    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = "CVV kodunu girin (3 haneli)";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
    }

    if (!formData.address || formData.address.length < 5) {
      newErrors.address = "Adres bilgisi girin";
    }

    if (!formData.city || formData.city.length < 2) {
      newErrors.city = "Şehir bilgisi girin";
    }

    if (!formData.zipCode || formData.zipCode.length !== 5) {
      newErrors.zipCode = "Posta kodu girin (5 haneli)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Demo modunda ödeme işlemi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Başarılı ödeme sonrası
      navigate(`/payment-success?plan=${encodeURIComponent(planName)}&price=${price}`);
    } catch (error) {
      console.error("Ödeme hatası:", error);
      alert("Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-blue-100'}`}>
        <div className="transform scale-75 origin-left"><Logo /></div>
        <Link to="/plans" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={20} />
          Planlara Dön
        </Link>
      </nav>

      {/* İÇERİK */}
      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        {/* Başlık */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4">
            <CreditCard size={32} />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Ödeme Bilgileri</h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Güvenli ödeme ile {planName} planını aktifleştirin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL: Ödeme Formu */}
          <div className="lg:col-span-2">
            <div className={`p-8 rounded-3xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lock size={24} className="text-green-500" />
                Güvenli Ödeme
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Kart Bilgileri */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Kart Bilgileri</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Kart Numarası *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.cardNumber ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Kart Üzerindeki İsim *</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="AD SOYAD"
                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.cardName ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {errors.cardName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.cardName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">Son Kullanma *</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            errors.expiryDate ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.expiryDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2">CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength={3}
                          className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            errors.cvv ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fatura Bilgileri */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Fatura Bilgileri</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">E-Posta *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="fatura@ornek.com"
                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.email ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Adres *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Adres satırı"
                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.address ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">Şehir *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="İstanbul"
                          className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            errors.city ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2">Posta Kodu *</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="34000"
                          maxLength={5}
                          className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            errors.zipCode ? 'border-red-500' : darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                        {errors.zipCode && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      {price}₺ Ödemeyi Tamamla
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* SAĞ: Özet */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-3xl shadow-xl sticky top-32 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className="text-xl font-bold mb-6">Sipariş Özeti</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Plan</span>
                  <span className="font-bold">{planName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fiyat</span>
                  <span className="font-bold text-2xl text-blue-600">{price}₺</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Periyot</span>
                  <span className="font-bold">Aylık</span>
                </div>
              </div>

              <div className={`border-t pt-4 mb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Toplam</span>
                  <span className="font-bold text-2xl text-blue-600">{price}₺</span>
                </div>
              </div>

              {/* Güvenlik Badge'leri */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield size={16} className="text-green-500" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>256-bit SSL Şifreleme</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Güvenli Ödeme</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>14 Gün İade Garantisi</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Payment;





