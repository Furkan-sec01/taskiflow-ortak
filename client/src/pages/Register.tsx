import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 👇 1. ADIM: Mavi Logoyu buradan çağırıyoruz
import Logo from "../components/Logo"; 

const Register = () => {
  // State Tanımları (Kutucukların içindeki verileri tutmak için)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();

  // 👇 Kayıt Ol butonuna basınca çalışacak fonksiyon
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if(res.ok){
        localStorage.setItem("token",data.token);
        localStorage.setItem("user",JSON.stringify(data.user));

        alert("Kayıt Başarılı.");
        navigate("/dashboard");

        window.location.reload();
      }
      else{
        alert(data.error || "Kayıt başarısız oldu.");
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Sunucuyla bağlantı kurulamadı.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      {/* Kart Yapısı */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        {/* Başlık ve Logo Kısmı */}
        <div className="mb-8 flex flex-col items-center text-center">
          {/* 🔥 BURAYA LOGO GELDİ */}
          <div className="mb-4 transform scale-90">
            <Logo />
          </div>
          <p className="text-gray-500 font-medium">Yeni bir hesap oluştur</p>
        </div>

        {/* Form Alanı */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Ad Soyad Input */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Ad Soyad
            </label>
            <input
              type="text"
              placeholder="Adınız ve soyadınız"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* E-posta Input */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              E-posta
            </label>
            <input
              type="email"
              placeholder="ornek@email.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Şifre Input */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Şifre
            </label>
            <input
              type="password"
              placeholder="••••••"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Kayıt Ol Butonu */}
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition duration-200 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Kayıt Ol
          </button>

        </form>

        {/* Alt Link (Giriş Yap) */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Zaten bir hesabın var mı?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Giriş yap
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;