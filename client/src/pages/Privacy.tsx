import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Shield, ArrowLeft, Lock, Eye, Database, UserCheck } from "lucide-react";
import Logo from "../components/Logo";

const Privacy = () => {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-2xl mb-4">
              <Shield size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Gizlilik Politikası</h1>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Son Güncelleme: 1 Ocak 2025
            </p>
          </div>

          {/* İçerik */}
          <div className={`space-y-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-3xl p-8 md:p-12`}>
            
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock size={24} className="text-blue-600" />
                1. Gizliliğinize Önem Veriyoruz
              </h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                TaskiFlow olarak, kişisel verilerinizin gizliliğini korumak bizim önceliğimizdir. 
                Bu gizlilik politikası, hangi bilgileri topladığımızı, nasıl kullandığımızı ve 
                koruduğumuzu açıklamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Database size={24} className="text-blue-600" />
                2. Topladığımız Bilgiler
              </h2>
              <p className={`leading-relaxed mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Hizmetlerimizi sağlamak için aşağıdaki bilgileri topluyoruz:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>Hesap Bilgileri:</strong> Ad, e-posta adresi, şifre (şifrelenmiş)</li>
                <li><strong>Kullanım Verileri:</strong> Görevler, projeler, ekip üyeleri ve platform içi etkileşimleriniz</li>
                <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri, kullanım zamanları</li>
                <li><strong>İletişim Bilgileri:</strong> Destek talepleriniz ve bizimle yaptığınız iletişimler</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye size={24} className="text-blue-600" />
                3. Bilgilerinizi Nasıl Kullanıyoruz?
              </h2>
              <p className={`leading-relaxed mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Hizmetlerimizi sağlamak ve iyileştirmek</li>
                <li>Hesabınızı yönetmek ve kimlik doğrulama yapmak</li>
                <li>Müşteri desteği sağlamak ve sorularınızı yanıtlamak</li>
                <li>Güvenlik ihlallerini tespit etmek ve önlemek</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                <li>Size önemli bildirimler göndermek (izin verdiğiniz takdirde)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield size={24} className="text-blue-600" />
                4. Bilgilerinizin Güvenliği
              </h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanıyoruz:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>SSL/TLS şifreleme ile veri aktarımı</li>
                <li>Şifrelerin bcrypt ile hash'lenmesi</li>
                <li>Düzenli güvenlik denetimleri ve güncellemeler</li>
                <li>Sınırlı erişim kontrolleri</li>
                <li>Güvenli veritabanı yönetimi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Bilgilerin Paylaşımı</h2>
              <p className={`leading-relaxed mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Kişisel bilgilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmıyoruz:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>Yasal Zorunluluklar:</strong> Yasal bir talep veya mahkeme kararı durumunda</li>
                <li><strong>Hizmet Sağlayıcılar:</strong> Hizmetlerimizi sağlamak için çalıştırdığımız güvenilir üçüncü taraf hizmetler (veri depolama, hosting vb.)</li>
                <li><strong>İş Transferleri:</strong> Şirket birleşmesi, devri veya varlık satışı durumunda</li>
                <li><strong>İzin:</strong> Açıkça izin verdiğiniz durumlarda</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Çerezler (Cookies)</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Platformumuz, deneyiminizi iyileştirmek için çerezler kullanır. Çerezler, tarayıcınızda saklanan 
                küçük veri dosyalarıdır. Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz, ancak bu durumda 
                bazı özellikler düzgün çalışmayabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCheck size={24} className="text-blue-600" />
                7. Haklarınız
              </h2>
              <p className={`leading-relaxed mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Veri Saklama</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Kişisel verilerinizi, hesabınız aktif olduğu sürece ve yasal saklama yükümlülüklerimiz gereği saklıyoruz. 
                Hesabınızı sildiğinizde, verileriniz 30 gün içinde kalıcı olarak silinir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Çocukların Gizliliği</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Hizmetlerimiz 18 yaş altındaki kişilere yönelik değildir. Bilerek 18 yaş altındaki kişilerden 
                kişisel bilgi toplamıyoruz. Eğer bir ebeveyn veya vası olarak, çocuğunuzun bize bilgi verdiğini 
                fark ederseniz, lütfen bizimle iletişime geçin.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Politika Değişiklikleri</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler durumunda, 
                e-posta veya platform içi bildirim ile sizi bilgilendireceğiz. Değişikliklerden sonra 
                hizmetlerimizi kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. İletişim</h2>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Gizlilik politikamız hakkında sorularınız, endişeleriniz veya haklarınızı kullanmak istiyorsanız, 
                lütfen <Link to="/contact" className="text-blue-600 hover:underline">iletişim sayfamızdan</Link> bizimle iletişime geçin.
              </p>
            </section>

          </div>

          {/* Alt Bilgi */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Bu belge KVKK ve GDPR uyumludur. Sorularınız için veri koruma sorumlusuna başvurabilirsiniz.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Privacy;





