# TaskiFlow - Geliştirici Kurulum Rehberi

TaskiFlow, React (Frontend) ve Node.js (Express + Prisma) (Backend) kullanılarak geliştirilmiş bir görev yönetim uygulamasıdır.

Bu rehber, projeyi yerel geliştirme ortamınızda çalıştırmanız için gerekli adımları içerir.

---

## 1. Bağımlılıkların Yüklenmesi (Installation)

Projeyi bilgisayarınıza klonladıktan sonra hem backend hem de frontend için gerekli paketleri yüklemeniz gerekir.

### Backend Paketleri

```bash
cd server
npm install
```

### Frontend Paketleri

```bash
cd ../client
npm install
```

---

## 2. Çevresel Değişkenler (.env Ayarları)

1. `server` klasörünün içine gidin.
2. `.env` adında yeni bir dosya oluşturun.
3. Aşağıdaki içeriği ekleyin ve kendi sisteminize göre düzenleyin:

```env
# PostgreSQL bağlantı adresiniz:
DATABASE_URL="postgresql://kullanici_adi:sifre@localhost:5432/taskiflow_db?schema=public"

# JWT için gizli anahtar:
JWT_SECRET="buraya_cok_gizli_ve_uzun_rastgele_bir_yazi_yazin_12345"
```

Not:  
`DATABASE_URL` içindeki kullanıcı adı, şifre ve veritabanı ismini kendi PostgreSQL kurulumunuza göre güncellemeyi unutmayın.

---

## 3. Veritabanı Kurulumu (Migration)

Veritabanı şemasını oluşturmak ve migration dosyalarını uygulamak için aşağıdaki komutu çalıştırın:

```bash
cd server
npx prisma migrate dev
```

Bu komut:
- Mevcut migration geçmişini uygular
- Veritabanı tablolarını oluşturur
- Prisma Client'ı günceller

---

## 4. Projeyi Çalıştırma

Projeyi çalıştırmak için iki ayrı terminal kullanmanız gerekmektedir.

### Terminal 1 – Backend'i Başlatma

```bash
cd server
node server.js
```

Backend varsayılan olarak genellikle:

```
http://localhost:5000
```

adresinde çalışır.

### Terminal 2 – Frontend'i Başlatma

Yeni bir terminal açın ve:

```bash
cd client
npm run dev
```

Frontend genellikle:

```
http://localhost:5173
```

adresinde çalışır.

---

## Kullanılan Teknolojiler

### Backend
- Node.js  
- Express.js  
- Prisma ORM  
- PostgreSQL  
- JWT Authentication  

### Frontend
- React  
- Vite  

---

## Notlar

- PostgreSQL'in sisteminizde kurulu ve çalışır durumda olduğundan emin olun.
- `.env` dosyasını kesinlikle GitHub’a yüklemeyin (`.gitignore` içinde olduğundan emin olun).
- Herhangi bir hata alırsanız migration komutunu tekrar çalıştırmayı deneyin.

---

## Geliştirici

TaskiFlow – Modern görev yönetim uygulaması
