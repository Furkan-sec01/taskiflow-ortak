import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FileText, ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";

const Terms = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      
      {/* ================= NAVBAR ================= */}
      <nav className={`fixed w-full z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-blue-100'}`}>
        <div className="transform scale-75 origin-left"><Logo /></div>
        <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={20} />
          Ana Sayfaya Dön
        </Link>
      </nav>

      {/* ================= İÇERİK ================= */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Başlık */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4">
              <FileText size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Kullanım Şartları</h1>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Son Güncelleme: 1 Ocak 2025
            </p>
          </div>

          {/* İçerik */}
          <div className={`space-y-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-3xl p-8 md:p-12`}>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Genel Hükümler</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                TaskiFlow ("Biz", "Bizim", "Hizmet") hizmetlerini kullanarak, aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
                Bu şartları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayın.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Hizmet Tanımı</h2>
              <p className={`leading-relaxed mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                TaskiFlow, ekiplerin görevlerini, projelerini ve iş akışlarını yönetmelerine olanak sağlayan bir proje yönetim platformudur. 
                Hizmetlerimiz şunları içerir:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Görev ve proje yönetimi</li>
                <li>Ekip işbirliği araçları</li>
                <li>Bildirim ve takip sistemleri</li>
                <li>Raporlama ve analitik özellikleri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Kullanıcı Hesabı</h2>
              <p className={`leading-relaxed mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Hizmetlerimizi kullanmak için bir hesap oluşturmanız gerekir. Hesap oluştururken:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Doğru, güncel ve eksiksiz bilgiler sağlamalısınız</li>
                <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz</li>
                <li>Hesabınızda meydana gelen tüm faaliyetlerden sorumlusunuz</li>
                <li>Şifrenizi başkalarıyla paylaşmamalısınız</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Kullanıcı Yükümlülükleri</h2>
              <p className={`leading-relaxed mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Hizmetlerimizi kullanırken aşağıdakilere uymalısınız:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Yasalara ve düzenlemelere uygun davranmak</li>
                <li>Başkalarının haklarına saygı göstermek</li>
                <li>Zararlı, tehdit edici, yanıltıcı veya yasadışı içerik paylaşmamak</li>
                <li>Virüs, kötü amaçlı yazılım veya zararlı kod yüklememek</li>
                <li>Hizmetlerimizin güvenliğini veya bütünlüğünü bozmaya çalışmamak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Fikri Mülkiyet Hakları</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                TaskiFlow platformu ve tüm içeriği (logo, tasarım, metin, grafik, yazılım vb.) bizim veya lisans verdiğimiz 
                tarafların mülkiyetindedir. Bu içerikleri izinsiz kopyalayamaz, değiştiremez veya dağıtamazsınız.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Veri ve Gizlilik</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi için 
                <Link to="/privacy" className="text-blue-600 hover:underline ml-1">Gizlilik Politikamızı</Link> inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Hizmet Değişiklikleri ve Kesintiler</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Hizmetlerimizi herhangi bir zamanda değiştirme, askıya alma veya sonlandırma hakkını saklı tutarız. 
                Bakım, güncelleme veya teknik sorunlar nedeniyle hizmetlerimizde geçici kesintiler olabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Sorumluluk Sınırlaması</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                TaskiFlow, hizmetlerimizin kesintisiz, hatasız veya güvenli olacağını garanti etmez. 
                Hizmetlerimizin kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu değiliz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. İptal ve İade</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ücretli planlar için iptal ve iade koşulları, seçtiğiniz plana göre değişiklik gösterebilir. 
                Detaylı bilgi için lütfen <Link to="/contact" className="text-blue-600 hover:underline">bizimle iletişime geçin</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Değişiklikler</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Bu kullanım şartlarını herhangi bir zamanda değiştirme hakkını saklı tutarız. 
                Önemli değişiklikler durumunda kullanıcıları bilgilendireceğiz. Değişikliklerden sonra hizmetlerimizi 
                kullanmaya devam etmeniz, güncellenmiş şartları kabul ettiğiniz anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. İletişim</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Bu kullanım şartları hakkında sorularınız varsa, lütfen 
                <Link to="/contact" className="text-blue-600 hover:underline ml-1">iletişim sayfamızdan</Link> bize ulaşın.
              </p>
            </section>

          </div>

          {/* Alt Bilgi */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Bu belge yasal bir dokümandır. Sorularınız için hukuk danışmanınıza başvurun.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Terms;





