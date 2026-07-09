import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Mail, MapPin, Phone, Send, Facebook, Twitter, Instagram, Linkedin, ArrowLeft, Clock, MessageCircle, HelpCircle, Briefcase, Globe, CheckCircle } from "lucide-react";
import Logo from "../components/Logo";
import newLogo from '../assets/new_logo.png';

const Contact = () => {
  const { darkMode } = useTheme();
  
  // Form verilerini tutmak için state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    contactType: "genel"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Buraya ileride backend bağlantısı yapılacak
    alert(`Mesajınız alındı Sayın ${formData.name}! En kısa sürede döneceğiz.`);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-blue-100'}`}>
        <div className="transform scale-75 origin-left"><Logo /></div>
        <div className={`hidden md:flex gap-8 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Link to="/features" className="hover:text-blue-600 transition-colors">ÖZELLİKLER</Link>
          <Link to="/solutions" className="hover:text-blue-600 transition-colors">ÇÖZÜMLER</Link>
          <Link to="/plans" className="hover:text-blue-600 transition-colors">FİYATLAR</Link>
        </div>
        <div className="flex items-center gap-4">
            <Link to="/" className={`text-sm font-bold flex items-center gap-2 hover:underline ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
             <ArrowLeft size={18}/> Ana Sayfa
            </Link>
        </div>
      </nav>

      {/* İÇERİK */}
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Başlık */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Bizimle <span className="text-blue-600">İletişime Geçin</span></h1>
          <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Projeleriniz, sorularınız veya iş birlikleri için NDM Software ekibi yanınızda. Size yardımcı olmaktan mutluluk duyarız.
          </p>
        </div>

        {/* Hızlı İletişim Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Genel Sorular</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ürün hakkında bilgi almak için</p>
            <a href="mailto:ndmsoftware@gmail.com" className="text-blue-600 font-semibold text-sm hover:underline">ndmsoftware@gmail.com</a>
          </div>

          <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <HelpCircle size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Teknik Destek</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Yardıma mı ihtiyacınız var?</p>
            <a href="mailto:ndmsoftware@gmail.com" className="text-blue-600 font-semibold text-sm hover:underline">ndmsoftware@gmail.com</a>
          </div>

          <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Briefcase size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">İş Ortaklığı</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>İş birliği fırsatları için</p>
            <a href="mailto:ndmsoftware@gmail.com" className="text-blue-600 font-semibold text-sm hover:underline">ndmsoftware@gmail.com</a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* SOL TARAF: İLETİŞİM BİLGİLERİ & NDM BRANDING */}
          <div className={`p-8 rounded-3xl border shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            
            {/* NDM Logo Alanı */}
            <div className="mb-8 flex items-center gap-4 border-b pb-8 border-gray-200/20">
              <div className={`p-3 rounded-xl shadow-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <img 
                  src={newLogo} 
                  alt="NDM Software Logo" 
                  className="h-28 w-auto object-contain mb-6" 
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">NDM Software</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Teknoloji Çözümleri Merkezi</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={24}/>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Adres</h4>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    İskenderpaşa Mah. Yeşil Tekke Kuyulu Sk. Burak Apart Sitesi NO:8A Fatih/İSTANBUL
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={24}/>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">E-Posta</h4>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    <a href="mailto:ndmsoftware@gmail.com" className="hover:text-blue-600 hover:underline">ndmsoftware@gmail.com</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <Phone size={24}/>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Telefon</h4>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    <a href="tel:+905343384982" className="hover:text-blue-600 hover:underline">+90 534 338 49 82</a>
                  </p>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Hafta içi: 09:00 - 18:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <Clock size={24}/>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Çalışma Saatleri</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pazartesi - Cuma: 09:00 - 18:00<br/>
                    Cumartesi: 10:00 - 14:00<br/>
                    Pazar: Kapalı
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <Globe size={24}/>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Yanıt Süresi</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    E-posta: 24 saat içinde<br/>
                    Acil durumlar: 2 saat içinde
                  </p>
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="mt-10 flex gap-4">
               <div className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Facebook size={20}/></div>
               <div className="p-3 rounded-full bg-blue-50 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors cursor-pointer"><Twitter size={20}/></div>
               <div className="p-3 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white transition-colors cursor-pointer"><Instagram size={20}/></div>
               <div className="p-3 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors cursor-pointer"><Linkedin size={20}/></div>
            </div>
          </div>

          {/* SAĞ TARAF: FORM */}
          <div className={`p-8 rounded-3xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-2xl font-bold mb-2">Bize Mesaj Gönderin</h3>
            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Formu doldurun, size en kısa sürede dönüş yapalım.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Ad Soyad *</label>
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    placeholder="Adınız ve soyadınız" 
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">E-Posta *</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="mail@ornek.com" 
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">İletişim Türü</label>
                <select 
                  name="contactType" 
                  value={formData.contactType} 
                  onChange={(e) => setFormData({...formData, contactType: e.target.value})}
                  className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                >
                  <option value="genel">Genel Soru</option>
                  <option value="teknik">Teknik Destek</option>
                  <option value="satis">Satış ve Fiyatlandırma</option>
                  <option value="isbirligi">İş Birliği</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Konu *</label>
                <input 
                  type="text" name="subject" value={formData.subject} onChange={handleChange} required
                  placeholder="Mesajınızın konusu" 
                  className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Mesajınız *</label>
                <textarea 
                  name="message" value={formData.message} onChange={handleChange} required
                  rows={5} 
                  placeholder="Mesajınızı detaylı bir şekilde yazın..." 
                  className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Send size={20} /> Mesajı Gönder
              </button>
            </form>
          </div>

        </div>

        {/* SSS Bölümü */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Sık Sorulan Sorular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <CheckCircle size={20} className="text-blue-600" />
                Ne kadar sürede yanıt alırım?
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Genellikle 24 saat içinde yanıt veriyoruz. Acil durumlar için 2 saat içinde dönüş yapıyoruz.
              </p>
            </div>

            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <CheckCircle size={20} className="text-blue-600" />
                Ücretsiz deneme var mı?
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Evet! Başlangıç planımız tamamen ücretsizdir. İstediğiniz zaman yükseltebilir veya iptal edebilirsiniz.
              </p>
            </div>

            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <CheckCircle size={20} className="text-blue-600" />
                Hangi ödeme yöntemlerini kabul ediyorsunuz?
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Kredi kartı, banka kartı ve banka havalesi ile ödeme yapabilirsiniz. Tüm ödemeler güvenli şekilde işlenir.
              </p>
            </div>

            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <CheckCircle size={20} className="text-blue-600" />
                İade politikası nedir?
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                14 gün içinde koşulsuz iade garantisi sunuyoruz. Memnun kalmazsanız tam iade yapıyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contact;