import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Shield, Monitor, Smartphone, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { API_BASE } from "../config/api";

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

type SessionItem = {
  id: string;
  deviceName: string;
  deviceType: string;
  lastActive: string;
  current: boolean;
};

// Sunucu, başkalarının çalışmasını silmemek için hesap silmeyi 409 ile
// reddedebilir: kullanıcı hâlâ başka üyesi olan bir ekibin/projenin sahibiyse.
// O durumda hangi kayıtların engellediğini kullanıcıya göstermemiz gerekiyor.
type BlockingItems = {
  organizations: { id: string; name: string; memberCount: number }[];
  projects: { id: string; title: string }[];
};

export default function SecurityPage() {
  const navigate = useNavigate();
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");

  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const [twoFA, setTwoFA] = useState({ auth: false, sms: true, email: true });

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [userEmail, setUserEmail] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePass, setDeletePass] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [blocking, setBlocking] = useState<BlockingItems | null>(null);

  const strength = getStrength(newPass);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE}/api/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]));

    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUserEmail(data.email || ""))
      .catch(() => setUserEmail(""));
  }, []);

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    if (!curPass || !newPass || !confPass) {
      setPwError("Tüm alanları doldurun.");
      return;
    }

    setPwSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: curPass,
          newPassword: newPass,
          confirmPassword: confPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Şifre güncellenemedi.");
      }

      setPwSuccess(data.message || "Şifre başarıyla güncellendi.");
      setCurPass("");
      setNewPass("");
      setConfPass("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Oturum sonlandırılamadı.");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeletePass("");
    setDeleteError("");
    setBlocking(null);
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setBlocking(null);

    if (!deletePass) {
      setDeleteError("Devam etmek için şifrenizi girin.");
      return;
    }

    setDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePass }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setBlocking({
            organizations: data.blockingOrganizations || [],
            projects: data.blockingProjects || [],
          });
        }
        throw new Error(data.error || "Hesap silinemedi.");
      }

      // Oturum kayıtları sunucuda kullanıcıyla birlikte silindi, token artık
      // geçersiz. Yereldeki kalıntıyı da temizlemezsek uygulama silinmiş bir
      // kullanıcıyla giriş yapılmış gibi davranmaya çalışır.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("activeOrgId");

      toast.success("Hesabınız kalıcı olarak silindi.");
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setDeleting(false);
    }
  };

  const handleTerminateAllOthers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/sessions/others`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Oturumlar sonlandırılamadı.");
      setSessions((prev) => prev.filter((s) => s.current));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

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

        {pwError && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-3">{pwError}</p>
        )}
        {pwSuccess && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-3">{pwSuccess}</p>
        )}

        <button
          onClick={handleChangePassword}
          disabled={pwSaving}
          className="mt-4 px-5 py-2 rounded-lg bg-[#4F6EF7] text-white text-sm font-medium hover:bg-[#3d5ce0] transition-colors disabled:opacity-60"
        >
          {pwSaving ? "Güncelleniyor..." : "Şifreyi güncelle"}
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
            desc: userEmail || "E-posta bulunamadı",
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

        {sessions.length === 0 && (
          <p className="text-sm text-gray-400">Aktif oturum bulunamadı.</p>
        )}

        {sessions.map((s, i, arr) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              {s.deviceType === "mobile" ? (
                <Smartphone size={15} className="text-gray-400" />
              ) : (
                <Monitor size={15} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.deviceName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(s.lastActive).toLocaleString()}</p>
            </div>
            {s.current ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Bu cihaz</span>
            ) : (
              <button
                onClick={() => handleTerminateSession(s.id)}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors"
              >
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

        {/* Eylemler artık etiket metniyle eşleştirilmiyor; her satır kendi
            onClick'ini taşıyor. "Hesabı sil" butonu daha önce
            onClick={undefined} ile duruyordu, yani hiçbir şey yapmıyordu. */}
        {[
          {
            label: "Tüm oturumları sonlandır",
            desc: "Bu cihaz dışındaki tüm oturumları kapat",
            action: "Sonlandır",
            onClick: handleTerminateAllOthers,
          },
          {
            label: "Hesabı sil",
            desc: "Hesabınız ve tüm verileriniz kalıcı olarak silinir",
            action: "Hesabı sil",
            onClick: () => setDeleteOpen(true),
          },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className={`flex items-center justify-between py-2.5 ${i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
          >
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={item.onClick}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors"
            >
              {item.action}
            </button>
          </div>
        ))}
      </div>

      {/* Hesap silme onay penceresi. Sunucu şifreyi tekrar istediği için
          window.confirm yetmiyor. */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-base font-semibold text-red-700">Hesabı kalıcı olarak sil</p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Bu işlem <strong>geri alınamaz</strong>. Kişisel görevleriniz, belgeleriniz,
              bildirimleriniz, ödeme geçmişiniz ve yalnızca size ait ekipler ile projeler
              kalıcı olarak silinir.
            </p>

            {/* 409: hangi kayıtların engellediğini tek tek göster ki kullanıcı
                ne yapması gerektiğini bilsin. */}
            {blocking && (blocking.organizations.length > 0 || blocking.projects.length > 0) && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  Önce bunları devretmeniz veya silmeniz gerekiyor:
                </p>
                <ul className="space-y-1">
                  {blocking.organizations.map((org) => (
                    <li key={org.id} className="text-xs text-amber-800 dark:text-amber-300">
                      • <strong>{org.name}</strong> ekibi ({org.memberCount} üye)
                    </li>
                  ))}
                  {blocking.projects.map((project) => (
                    <li key={project.id} className="text-xs text-amber-800 dark:text-amber-300">
                      • <strong>{project.title}</strong> projesi
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <PasswordInput
              label="Onaylamak için şifreniz"
              value={deletePass}
              onChange={setDeletePass}
            />

            {deleteError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-3">{deleteError}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePass}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? "Siliniyor..." : "Hesabımı kalıcı olarak sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}