import { useState } from "react";
import { Lock, Shield, Monitor, Smartphone, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
        enabled ? "bg-[#4F6EF7]" : "bg-gray-200 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
          enabled ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  extra?: React.ReactNode;
}

function PasswordInput({ label, placeholder = "••••••••", value, onChange, extra }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[10px] uppercase tracking-wider font-medium text-gray-400 mb-1">{label}</p>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2.5 py-1.5 pr-8 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-[#4F6EF7] focus:ring-2 focus:ring-[#4F6EF7]/10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {extra}
    </div>
  );
}

function getStrength(val: string): { score: number; label: string; color: string } {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const map = [
    { label: "", color: "" },
    { label: "Zayıf", color: "#E24B4A" },
    { label: "Orta", color: "#EF9F27" },
    { label: "Güçlü", color: "#639922" },
    { label: "Çok güçlü", color: "#1D9E75" },
  ];
  return { score, ...map[score] };
}

export default function SecurityPage() {
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");

  const [twoFA, setTwoFA] = useState({ auth: false, sms: true, email: true });

  const strength = getStrength(newPass);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Security & Access</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hesap güvenliğini ve erişim ayarlarını yönet</p>
      </div>

      {/* Şifre Değiştir */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={14} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Şifre değiştir</p>
        </div>
        <p className="text-xs text-gray-400 mb-4">En az 8 karakter, bir büyük harf ve rakam içermelidir</p>

        <PasswordInput label="Mevcut şifre" value={curPass} onChange={setCurPass} />
        <PasswordInput
          label="Yeni şifre"
          value={newPass}
          onChange={setNewPass}
          extra={
            newPass.length > 0 ? (
              <div className="mt-1.5">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background: i <= strength.score ? strength.color : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-[11px]" style={{ color: strength.color }}>{strength.label}</p>
                )}
              </div>
            ) : null
          }
        />
        <PasswordInput label="Şifre tekrar" value={confPass} onChange={setConfPass} />

        <button className="mt-4 px-5 py-2 rounded-lg bg-[#4F6EF7] text-white text-sm font-medium hover:bg-[#3d5ce0] transition-colors">
          Şifreyi güncelle
        </button>
      </div>

      {/* 2FA */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">İki faktörlü doğrulama</p>
        </div>
        <p className="text-xs text-gray-400 mb-4">Hesabınızı ek bir güvenlik katmanıyla koruyun</p>

        {[
          {
            key: "auth" as const,
            label: "Authenticator uygulaması",
            desc: "Google Authenticator, Authy vb.",
            badge: twoFA.auth ? { text: "Aktif", cls: "bg-green-50 text-green-700" } : { text: "Kurulmadı", cls: "bg-amber-50 text-amber-700" },
          },
          {
            key: "sms" as const,
            label: "SMS doğrulama",
            desc: "+90 555 *** ** 00",
            badge: twoFA.sms ? { text: "Aktif", cls: "bg-green-50 text-green-700" } : { text: "Pasif", cls: "bg-gray-100 text-gray-500" },
          },
          {
            key: "email" as const,
            label: "E-posta doğrulama",
            desc: "sinan@test.com",
            badge: twoFA.email ? { text: "Aktif", cls: "bg-green-50 text-green-700" } : { text: "Pasif", cls: "bg-gray-100 text-gray-500" },
          },
        ].map((item, i, arr) => (
          <div
            key={item.key}
            className={`flex items-center gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${item.badge.cls}`}>
              {item.badge.text}
            </span>
            <Toggle
              enabled={twoFA[item.key]}
              onToggle={() => setTwoFA((p) => ({ ...p, [item.key]: !p[item.key] }))}
            />
          </div>
        ))}
      </div>

      {/* Aktif Oturumlar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Monitor size={14} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Aktif oturumlar</p>
        </div>
        <p className="text-xs text-gray-400 mb-4">Hesabınıza bağlı tüm cihazlar</p>

        {[
          { icon: <Monitor size={15} className="text-gray-400" />, name: "Windows · Chrome", meta: "İstanbul, TR · Şu an aktif", current: true },
          { icon: <Smartphone size={15} className="text-gray-400" />, name: "iPhone · Safari", meta: "İstanbul, TR · 2 saat önce", current: false },
          { icon: <Monitor size={15} className="text-gray-400" />, name: "MacBook · Firefox", meta: "Ankara, TR · 3 gün önce", current: false },
        ].map((s, i, arr) => (
          <div
            key={s.name}
            className={`flex items-center gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.meta}</p>
            </div>
            {s.current ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Bu cihaz</span>
            ) : (
              <button className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors">
                Sonlandır
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tehlike Bölgesi */}
      <div className="bg-white dark:bg-gray-900 border border-red-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-red-500" />
          <p className="text-sm font-medium text-red-700">Tehlike bölgesi</p>
        </div>
        <p className="text-xs text-gray-400 mb-4">Bu işlemler geri alınamaz</p>

        {[
          { label: "Tüm oturumları sonlandır", desc: "Bu cihaz dışındaki tüm oturumları kapat" },
          { label: "Hesabı sil", desc: "Tüm veriler kalıcı olarak silinir" },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className={`flex items-center justify-between py-2.5 ${i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
          >
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors">
              {item.label === "Hesabı sil" ? "Hesabı sil" : "Sonlandır"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}