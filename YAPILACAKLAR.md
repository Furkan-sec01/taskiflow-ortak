# Yapılacaklar / Eksik ve Yarım Kalan Özellikler

Son güncelleme: 10.08.2026
Bu liste kod tabanının baştan sona taranmasıyla çıkarıldı. Her madde
dosya/satır referansı içeriyor. Öncelik sırası kabaca yukarıdan aşağıya.

---

## 0. Önceki notlar

- [ ] **Favicon değiştirilecek** — `client/index.html` hâlâ Vite'ın varsayılan
      `/vite.svg` ikonunu kullanıyor. Ayrıca sayfa başlığı `client` olarak
      duruyor ve `<html lang="en">` yazıyor (uygulama Türkçe).
      `client/public/` içinde vite.svg dışında dosya yok.
- [ ] **AI bölümü** — aşağıda "Tamamen devre dışı" başlığına taşındı.

---

## 1. Tamamen devre dışı olan özellikler

Bu özellikler arayüzde görünüyor ama arkasında çalışan hiçbir şey yok.

- [ ] **AI Asistan** (`/ai`) — dört ayrı yerde kopuk:
  1. `@google/generative-ai` paketi `server/package.json` içinde yok ve
     kurulu değil; `aiController.js`, `chatController.js` ve
     `geminiService.js` require edilirken `MODULE_NOT_FOUND` veriyor.
  2. `aiRoutes` ve `chatRoutes` `server.js`'e hiç bağlanmamış. (Sunucunun
     hâlâ ayağa kalkabilmesinin tek sebebi bu.)
  3. `client/src/pages/AI.tsx` isteği `/api/ai/chat` adresine, göreli yolla
     ve `Authorization` başlığı olmadan atıyor. Göreli yol sadece Vite
     dev proxy'si ile çalışır, production'da kırılır; uç ise auth istiyor.
  4. `GEMINI_API_KEY` tanımlı değil.
  - Ayrıca `AI.tsx` içindeki `PROJECT_CONTEXT` tamamen uydurma sabit veri
    ("PROJ-Alpha", "Ahmet K.", velocity 52). Gerçek projeye bağlanmalı.

- [ ] **E-posta doğrulama** (`/verify`) — `Verify.tsx` `POST /api/verify`
      adresine istek atıyor ama böyle bir uç hiç yok. Dahası `register`
      hiçbir zaman `verificationToken` üretmiyor, kullanıcıyı doğrudan
      `status: "active"` olarak oluşturuyor. Yani özelliğin tamamı yazılmamış.
      Karar gerekiyor: ya doğrulama akışı baştan yazılacak ya da sayfa
      kaldırılacak.

- [ ] **İletişim formu** (`/contact`) — `Contact.tsx:25` içindeki
      `handleSubmit` hiçbir yere istek atmıyor, sadece "Mesajınız alındı"
      toast'u gösterip formu temizliyor. Kullanıcı mesaj gönderdiğini
      sanıyor, mesaj hiçbir yere ulaşmıyor. Kodda `// Buraya ileride backend
  bağlantısı yapılacak` notu duruyor. `@emailjs/browser` bağımlılığı
      package.json'da kurulu ama hiçbir dosyada kullanılmıyor — muhtemelen
      bunun için eklenmişti.

- [ ] **Şifremi unuttum** — `Login.tsx:81` `href="#"`. Şifre sıfırlama akışı
      (token üretme, e-posta gönderme, yeni şifre belirleme) hiç yok.

---

## 2. Yarım kalan özellikler

- [x] ~~**Görev yorumları**~~ — 10.08'de eklendi. Yeni `TaskComment` modeli;
      `GET/POST /api/tasks/:taskId/comments` ve
      `DELETE /api/tasks/:taskId/comments/:commentId`. Yorumu yazan ya da
      proje sahibi silebiliyor. Yorum yapılınca görevin sahibine ve atanana
      bildirim gidiyor (kendi yorumuna gitmiyor). `authorId` bilerek
      opsiyonel + `SetNull`: hesabını silen kullanıcının yorumları ekipte
      kalıyor, "Silinmiş kullanıcı" olarak gösteriliyor.

- [x] ~~**Görev ekleri (attachment)**~~ — 10.08'de eklendi.
      `POST /api/tasks/:taskId/attachments` (multer) ve
      `DELETE /api/tasks/:taskId/attachments/:attachmentId`. Ayrı model
      açılmadı: mevcut `Document` modeline `taskId` eklendi, `documentUpload`
      altyapısı yeniden kullanılıyor. Görev ekleri ekip belgeleri ve kişisel
      belgeler listelerinde görünmüyor. Görev silinince yorumlar ve ekler
      cascade ile gidiyor, dosya diskten de siliniyor.

- [ ] **Sütun renk seçimi** — `Proje.tsx` sütun ayarlarındaki renk paleti
      sadece menüyü kapatıyor (`onClick={() => setOpenSettingsId(null)}`).
      Renk ne state'e yazılıyor ne de kaydediliyor; Prisma'daki `Column`
      modelinde `color` alanı da yok. Şema değişikliği gerekiyor.

- [ ] **Özel pano arka planı** — Kullanıcı kendi görselini yükleyebiliyor
      ama sunucuda sadece hazır arka planların indeksi (`backgroundIndex`)
      saklanıyor, dosya yükleme ucu yok. Şu an kullanıcıya "bu görsel
      kaydedilmez" uyarısı gösteriliyor (10.08'de eklendi), kalıcı çözüm değil.

- [ ] **İki faktörlü doğrulama (2FA)** — `Securitypage.tsx` içindeki üç
      anahtar tamamen yerel state. Hiçbir uca bağlı değil, SMS ve e-posta
      varsayılan olarak "Aktif" görünüyor ve ekranda sabit bir telefon
      numarası (`+90 555 *** ** 00`) yazıyor. Güvenlik sayfasında yanıltıcı;
      ya gerçekten yazılmalı ya da kaldırılmalı.

- [ ] **Fatura indirme** — `Billingpage.tsx` fatura geçmişi tablosundaki
      "İndir" butonu `disabled` ve "yakında eklenecek" başlığı taşıyor.
      PDF fatura üretimi yok.

- [ ] **Proje dışa aktarma** — `ExportProjects.tsx` çalışıyor (JSON/CSV/PDF)
      ancak yalnızca id, başlık, açıklama ve üye listesini dışa aktarıyor.
      Görevler, sütunlar ve sprintler dahil değil.

- [ ] **Bağlı hesaplar** (`/settings/connections`) — Sayfa adı entegrasyon
      (Google, Slack vb.) vaat ediyor ama içerik sadece oturum listesi;
      Güvenlik sayfasındaki listeyi tekrarlıyor. Ya gerçek entegrasyonlar
      eklenmeli ya da sayfa "Cihazlar" olarak yeniden adlandırılmalı.

---

## 3. Arayüzde gerçekmiş gibi görünen sahte veriler

- [ ] **Billing kullanım göstergeleri** — `Billingpage.tsx` içindeki tüm
      kullanım çubukları sabit: "Projeler 1/2", "Depolama 38/50 MB",
      "AI Kredisi 320/500", "Otomasyon 8/25". Hiçbiri gerçek veriden
      gelmiyor. Depolama ve AI kredisi kavramları sistemde hiç yok;
      proje sayısı ise `projectController`'daki `PLAN_PROJECT_LIMITS`'ten
      hesaplanabilir.

- [ ] **AI sayfası proje özeti** — Yukarıda geçti; sol paneldeki tüm
      istatistikler uydurma.

- [ ] **Kaynaklar sayfası** (`/resources`) — Dört kartın da bağlantısı
      `href="#"`. Rehber, blog, topluluk ve dokümantasyon içerikleri yok.

---

## 4. Backend'i hazır ama arayüzü olmayan uçlar

Bu uçlar sunucuda yazılmış ve çalışıyor, ancak istemcide hiçbir yerden
çağrılmıyor. Yani özellik yarısı yazılmış durumda.

- [ ] `POST /api/payments/cancel-subscription` — **Abonelik iptali.**
      Plans sayfasında "İstediğiniz zaman iptal edin" yazıyor ama kullanıcı
      arayüzden iptal edemiyor. Billing sayfasına buton eklenmeli.
      Not: mevcut uç `endDate`'i hemen "şimdi" yapıyor, yani ayın 2'sinde
      iptal eden kullanıcı kalan 28 günü kaybediyor. Dönem sonuna kadar
      erişimin sürmesi daha doğru olur.
- [ ] `POST /api/payments/change-plan` — Ücretsiz plana geçiş.
- [ ] `PUT /api/payments/billing-profile` — **Fatura bilgileri.**
      `BillingProfile` modeli (unvan, vergi no, vergi dairesi, adres) var
      ama bu bilgileri girebileceği hiçbir form yok.
- [ ] `GET /api/payments/history` — Ödeme geçmişi (overview içinde de
      geldiği için şu an gereksiz olabilir, karar verilmeli).

---

## 5. Eksik olan uçlar / yetenekler

- [x] ~~**Ekip sahipliği devri**~~ — 10.08'de eklendi.
      `POST /api/organizations/:orgId/transfer-ownership`; arayüzde ekip
      detay sayfasındaki "Sahipliği Devret" butonu. `Organization.ownerId`
      ve `User_Organization.role` tek transaction'da güncelleniyor. Devreden
      kişinin bu ekipteki projelerinin sahipliği de varsayılan olarak yeni
      sahibe geçiyor (`transferProjects: false` ile kapatılabilir), çünkü
      aksi hâlde kişi ekibi devretse bile projelere bağlı kaldığı için hâlâ
      ayrılamıyor/hesabını silemiyordu.
- [ ] **Projeden üye çıkarma** — Projeye üye eklenebiliyor
      (`POST /api/project/:projectId/invite`) ama çıkarma ucu yok.
- [ ] **Proje daveti onayı** — Adı "invite" olmasına rağmen kullanıcı
      doğrudan projeye ekleniyor; kabul/ret adımı yok. Ekip davetlerinde
      (`respond-invite`) bu akış var, projede yok.
- [ ] **Görev düzenleme** — Görev oluşturulabiliyor ve silinebiliyor ama
      başlık, açıklama, öncelik, tarih veya atanan kişi sonradan
      değiştirilemiyor. Güncelleme ucu yok.
- [ ] **Sütun yeniden adlandırma / sıralama** — `Column.order` alanı var
      ama sütun sırasını değiştirecek uç yok.
- [ ] **Görev sırası** — `Task.order` alanı var, sürükle-bırak sadece
      sütun değiştiriyor, sütun içi sıralama kaydedilmiyor.
- [ ] **Yardım sayfası** — Sidebar'daki "Help & feedback" `/help` adresine
      gidiyor, böyle bir route yok (artık 404 sayfası gösteriyor).
- [ ] **Sidebar arama ve yeni kayıt butonları** — Başlıktaki büyüteç ve
      kalem ikonlarının `onClick`'i yok, dekoratif duruyorlar.
- [ ] **Oturum temizliği** — JWT 24 saatte doluyor ama `Session` kayıtları
      kalıcı. Güvenlik sayfası süresi çoktan dolmuş oturumları "aktif"
      gösteriyor. Süresi geçmiş kayıtları temizleyen bir iş gerekiyor.

---

## 6. Teknik borç

- [ ] **`npm run lint` çalışmıyor** — `client/eslint.config.js`
      `typescript-eslint` paketini import ediyor, paket devDependencies'te
      yok.
- [ ] **`multer` istemci tarafında** — `client/package.json` içinde sunucu
      paketi olan `multer` bağımlılık olarak duruyor, tarayıcıda kullanımı
      yok.
- [ ] **`@emailjs/browser` kullanılmıyor** — Kurulu ama hiçbir dosyada
      import edilmiyor (bkz. İletişim formu).
- [ ] **Prisma 5 → 6 sürüm yükseltmesi** — `prisma generate` bir major
      sürüm geride olunduğunu bildiriyor.
- [ ] **Bildirim rozeti tazelenmiyor** — Sidebar'daki okunmamış sayısı
      yalnızca sayfa ilk yüklendiğinde çekiliyor, sonrasında güncellenmiyor.
- [x] ~~**`organizationController.js:2`** kullanılmayan `join` importu~~ —
      10.08'de kaldırıldı.
- [ ] **Artakalan dosyalar için süpürme işi** — Yükleme klasöründe
      veritabanında karşılığı olmayan dosya kalırsa (ör. sunucu silme
      işleminin ortasında çökerse) bunu temizleyen bir bakım işi yok.
      `src/utils/fileCleanup.js` tekil silmeleri hallediyor, ama periyodik
      bir kontrol faydalı olur.
- [ ] **Bundle boyutu** — Production build tek parça 1.365 kB (gzip 380 kB)
      uyarı veriyor. Route bazlı `lazy()` bölme yapılabilir.
- [ ] **Belge yükleme hataları 500 dönüyor** — `errorHandler.js` yalnızca
      avatar hatasının metnini tanıyor; "Desteklenmeyen dosya türü."
      mesajı genel 500 dalına düşüyor, 400 dönmeli.

---

## 6b. Kod incelemesinden çıkan, henüz giderilmemiş hatalar

10.08 incelemesinde bulundu. Hiçbiri o günkü değişikliklerden kaynaklanmıyor,
hepsi daha önceden vardı.

- [ ] **Süresi dolmuş abonelik hâlâ ücretli sayılıyor** —
      `expireOldSubscriptions` yalnızca `getBillingOverview` ve
      `getPaymentHistory` içinde çağrılıyor. `createProject` (ve `getMe`)
      doğrudan `status: "ACTIVE"` sorguluyor, `endDate` geçmiş olsa bile.
      Yani ödemesi biten kullanıcı Billing sayfasını açmadığı sürece PRO
      limitlerini (10 proje) kullanmaya devam ediyor. Kontrol sorgunun
      kendisine taşınmalı: `status: "ACTIVE", OR: [{endDate: null},
      {endDate: {gt: now}}]`.
- [ ] **"Tüm Görevlerim" listesinde tamamlananlar en üstte** —
      `personalTaskController.js` `orderBy: { status: "asc" }` kullanıyor;
      alfabetik olarak "DONE" < "TODO" olduğu için biten görevler başa
      geliyor.
- [ ] **Bildirimler sayfası hatayı sessizce yutuyor** —
      `Notifications.tsx` `res.ok` kontrolü yapmadan `data.map` çağırıyor;
      401/500 durumunda hata `catch` içinde yalnızca `console.log`'a
      düşüyor ve ekranda "Tüm bildirimler okundu" yazıyor.
- [ ] **Burndown grafiği sınırsız döngü** — `Reports.tsx` sprint başlangıcı
      ile bitişi arasında günlük nokta üretiyor, üst sınır yok ve her adımda
      tüm görevleri yeniden filtreliyor. Yanlış girilmiş uzak bir bitiş
      tarihi sekmeyi dondurur.
- [ ] **Davet yanıtlama akışında hata ayıklama log'ları** —
      `notificationController.js` içinde `console.log(invitation)`,
      "MEMBER EKLENİYOR" ve kullanıcı/organizasyon id'leri basılıyor.
- [ ] **Pano yanıtı artık her görevin yorum ve eklerini taşıyor** —
      Görev detayı ek istek beklemeden açılsın diye böyle yapıldı. Görev
      sayısı arttıkça yanıt büyür; ileride yorumları yalnızca detay
      açılırken çekmek (`GET /api/tasks/:taskId/comments` zaten var) daha
      doğru olur.

---

## 7. Güvenlik / veri bütünlüğü notları

- [ ] **`Organization.ownerId` gerçek bir ilişki değil** — Düz `String`
      alan, `User`'a `@relation` ile bağlı değil. Bu yüzden veritabanı
      sahipsiz ekip oluşmasını engellemiyor. (Hesap silmede elle
      hallediliyor, ama şema seviyesinde düzeltilmesi daha doğru.)
- [ ] **`Project.owner` ve `Document.uploader` `Restrict`** — `onDelete`
      tanımlı olmadığı için varsayılan `Restrict`. Kullanıcı silme bu yüzden
      elle temizlik yapmak zorunda. Şemada `Cascade`/`SetNull` kararı
      verilmeli.
- [x] ~~**`createProject` üyelik kontrolü yapmıyor**~~ — 10.08'de düzeltildi.
      Proje oluşturmadan önce `user_Organization` kaydı doğrulanıyor, üye
      olmayan 403 alıyor.
- [ ] **Kayıt/giriş yanıtı `verificationToken` sızdırıyor** —
      `authController` yanıttan yalnızca `password` alanını çıkarıyor.
- [ ] **`notificationController` ham hata mesajı dönüyor** — Dört handler
      istemciye `error.message` gönderiyor.
- [ ] **`paymentLimiter` IPv6 atlatılabilir** — Özel `keyGenerator` doğrudan
      `req.ip` kullanıyor; express-rate-limit v8 açılışta
      `ERR_ERL_KEY_GEN_IPV6` uyarısı veriyor. `ipKeyGenerator()` yardımcısı
      kullanılmalı.
- [ ] **3DS callback'i kimlik doğrulamasız** — iyzico POST edebilsin diye
      böyle olmak zorunda, ancak `status` alanı gövdeden geliyor. Şu an
      sadece `PENDING` kayıtlar `FAILED`'a çevriliyor; asıl koruma
      `conversationId`'nin tahmin edilemez bir UUID olması. Uzun vadede
      iyzico'nun imza/`retrieve` doğrulaması eklenmeli.

---
