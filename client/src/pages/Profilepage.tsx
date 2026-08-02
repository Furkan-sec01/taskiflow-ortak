import { useState, useEffect, useRef } from "react";
import { Pencil, Upload, User, Mail, Clock } from "lucide-react";
import { API_BASE } from "../config/api";

interface ProfileData {
  fullName: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;

  role: string;
  plan: string;
  subscriptionStatus: string;}

export default function ProfilePage() {
 const [editing, setEditing] = useState(false);
const [profile, setProfile] = useState<ProfileData>({
  fullName: "",
  username: "",
  bio: "",
  email: "",
  phone: "",
  location: "",
  avatarUrl: "",

  role: "",
  plan: "",
  subscriptionStatus: ""
});
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [stats, setStats] = useState({
  completedTaskCount: 0,
  projectCount: 0,
  teamMemberCount: 0,
});

const [activities, setActivities] = useState<
  {
    id: string;
    title: string;
    message: string;
    createdAt: string;
  }[]
>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  fetch(`${API_BASE}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      const userData = {
  fullName: data.name || "",
  username: data.username || "",
  bio: data.bio || "",
  email: data.email || "",
  phone: data.phone || "",
  location: data.location || "",
  avatarUrl: data.avatarUrl || "",
role: data.role || "",
plan: data.plan || "",
subscriptionStatus: data.subscriptionStatus || "",
};

      setProfile(userData);
      setDraft(userData);

      setStats({
        completedTaskCount: data.stats?.completedTaskCount ?? 0,
        projectCount: data.stats?.projectCount ?? 0,
        teamMemberCount:
          data.organizations?.length ??
          data.myOrganizations?.length ??
          0,
      });

      setActivities(data.notifications || []);
    });
}, []);

  const handleChange = (key: keyof ProfileData, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: draft.fullName,
          email: draft.email,
          username: draft.username,
          phone: draft.phone,
          bio: draft.bio,
          location: draft.location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Profil güncellenemedi.");
      }

      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : {};
      const updatedUser = {
        ...currentUser,
        ...data.user,
        fullName: data.user.name,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

setProfile({
  ...draft,
  role: profile.role,
  plan: profile.plan,
  subscriptionStatus: profile.subscriptionStatus,
});      setEditing(false);
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);

  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dakika önce`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} saat önce`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;

  const weeks = Math.floor(days / 7);

  if (weeks < 4) return `${weeks} hafta önce`;

  const months = Math.floor(days / 30);

  if (months < 12) return `${months} ay önce`;

  return `${Math.floor(days / 365)} yıl önce`;
};

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Sadece JPEG, PNG veya WEBP formatında resim yükleyebilirsiniz.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAvatarError("Resim boyutu en fazla 3MB olabilir.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_BASE}/api/users/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fotoğraf yüklenemedi.");
      }

      setProfile((prev) => ({
  ...prev,
  avatarUrl: data.avatarUrl,
}));

setDraft((prev) => ({
  ...prev,
  avatarUrl: data.avatarUrl,
}));

      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : {};
      localStorage.setItem("user", JSON.stringify({ ...currentUser, avatarUrl: data.avatarUrl }));
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profil</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Kişisel bilgilerini ve tercihlerini yönet
          </p>
        </div>
        <button
          onClick={() => { setEditing(true); setDraft(profile); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Pencil size={13} />
          Düzenle
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 flex items-center gap-5 dark:bg-gray-900 dark:border-gray-700">
        <div className="relative shrink-0">
          {profile.avatarUrl ? (
            <img
              src={`${API_BASE}${profile.avatarUrl}`}
              alt="Profil fotoğrafı"
              className="w-[72px] h-[72px] rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-[#4F6EF7] flex items-center justify-center text-white text-2xl font-medium">
              {profile.fullName?.trim()?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <button
            onClick={handleAvatarClick}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-60 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <Upload size={11} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div>
          {avatarError && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">{avatarError}</p>
          )}
          <p className="text-[19px] font-medium text-gray-900 dark:text-gray-100 mb-0.5">
            {profile.fullName}
          </p>
         <p className="text-sm text-gray-500 dark:text-gray-400 mb-2.5">
{profile.role === "OWNER"
  ? "Owner"
  : profile.role === "ADMIN"
  ? "Admin"
  : "Owner"}
</p>
          
        <div className="flex gap-2 flex-wrap">
  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
    {profile.plan === "FREE" ? "Free Plan" : "Pro Plan"}
  </span>

  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
{profile.subscriptionStatus === "ACTIVE" ? "Aktif" : "Pasif"}
  </span>

  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
    {profile.role === "OWNER"
      ? "Owner"
      : profile.role === "ADMIN"
      ? "Admin"
      : "Owner"}
  </span>
</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
  {
    label: "Tamamlanan görev",
    value: stats.completedTaskCount,
  },
  {
    label: "Aktif proje",
    value: stats.projectCount,
  },
  {
    label: "Organizasyonlar",
    value: stats.teamMemberCount,
  },
].map((s) => (
          <div key={s.label} className="bg-gray-100 rounded-lg px-4 py-3.5 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className="text-[22px] font-medium text-gray-900 dark:text-gray-100">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        {/* Personal Info */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <User size={14} className="text-gray-400 dark:text-gray-500" />
            Kişisel bilgiler
          </p>
          <Field label="Ad soyad" value={draft.fullName} editing={editing} onChange={(v) => handleChange("fullName", v)} />
          <Field label="Kullanıcı adı" value={draft.username} editing={editing} onChange={(v) => handleChange("username", v)} />
          <Field label="Biyografi" value={draft.bio} editing={editing} onChange={(v) => handleChange("bio", v)} last />
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 dark:bg-gray-900 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Mail size={14} className="text-gray-400 dark:text-gray-500" />
            İletişim
          </p>
          <Field label="E-posta" value={draft.email} editing={editing} onChange={(v) => handleChange("email", v)} />
          <Field label="Telefon" value={draft.phone} editing={editing} onChange={(v) => handleChange("phone", v)} />
          <Field label="Konum" value={draft.location} editing={editing} onChange={(v) => handleChange("location", v)} last />
        </div>
      </div>

     {/* Activity */}
<div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 dark:bg-gray-900 dark:border-gray-700">
  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
    <Clock size={14} className="text-gray-400 dark:text-gray-500" />
    Son aktivite
  </p>

  {activities.length === 0 ? (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Henüz aktivite bulunmuyor.
    </p>
  ) : (
    activities.map((activity) => (
      <div
        key={activity.id}
        className="flex items-center gap-2.5 py-2.5 border-b border-gray-100 last:border-none dark:border-gray-700"
      >
        <span className="w-2 h-2 rounded-full shrink-0 bg-blue-500" />

        <div className="flex-1">
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
            {activity.title}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activity.message}
          </p>
        </div>

        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatTimeAgo(activity.createdAt)}
        </span>
      </div>
    ))
  )}
</div>
      {/* Save Bar */}
      {editing && (
        <div>
          {saveError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-2 text-right">
              {saveError}
            </p>
          )}
          <div className="flex justify-end gap-2.5">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#4F6EF7] text-white text-sm font-medium hover:bg-[#3d5ce0] transition-colors disabled:opacity-60"
            >
             {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  last?: boolean;
}

function Field({ label, value, editing, onChange, last }: FieldProps) {
  return (
    <div className={last ? "" : "mb-3"}>
      <p className="text-[10px] uppercase tracking-wider font-medium text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </p>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 bg-white text-sm text-gray-900 outline-none focus:border-[#4F6EF7] focus:ring-2 focus:ring-[#4F6EF7]/10 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      ) : (
        <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
      )}
    </div>
  );
}