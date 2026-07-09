import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, CheckCheck, Filter } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "alert" | "info";
  time: string;
  isRead: boolean;
  createdAt: string;
}

type FilterType = "hepsi" | "okunmadı" | "uyarı";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("hepsi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const userId = user.id || user.user?.id;
        if (userId) {
          fetch(`http://localhost:5000/api/notifications?userId=${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
            .then(res => res.json())
            .then(data => {
              setNotifications(data.map((n: any) => ({ ...n, isRead: n.isRead ?? false })));
              setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
        } else { setLoading(false); }
      } catch { setLoading(false); }
    } else { setLoading(false); }
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: "PATCH" }).catch(console.error);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    fetch(`http://localhost:5000/api/notifications/read-all`, { method: "PATCH" }).catch(console.error);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetch(`http://localhost:5000/api/notifications/${id}`, { method: "DELETE" }).catch(console.error);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "okunmadı") return !n.isRead;
    if (filter === "uyarı") return n.type === "alert";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    if (type === "success") return <CheckCircle size={20} />;
    if (type === "alert") return <AlertTriangle size={20} />;
    return <Info size={20} />;
  };

  const getIconStyle = (type: string) => {
    if (type === "success") return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400";
    if (type === "alert") return "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400";
    return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400";
  };

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: "Hepsi", value: "hepsi" },
    { label: "Okunmadı", value: "okunmadı" },
    { label: "Uyarılar", value: "uyarı" },
  ];

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bildirimler</h1>
              <p className="text-sm text-gray-400">
                {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : "Tüm bildirimler okundu"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <CheckCheck size={16} />
              Tümünü Okundu Say
            </button>
          )}
        </div>

        {/* Filtreler */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={15} className="text-gray-400" />
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === btn.value
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {btn.label}
              {btn.value === "okunmadı" && unreadCount > 0 && (
                <span className="ml-1.5 bg-white text-blue-600 rounded-full px-1.5 text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bildirim Listesi */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Yükleniyor...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Hiç bildirim yok</p>
              <p className="text-sm mt-1">Şu an gösterilecek bir şey yok.</p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`group relative p-5 rounded-2xl border transition-all cursor-pointer
                  ${notif.isRead
                    ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm opacity-75"
                    : "bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-800 shadow-md hover:shadow-lg"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconStyle(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-gray-800 dark:text-gray-100 ${!notif.isRead ? "font-bold" : "font-semibold"}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{notif.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-400 hover:text-red-500"
                      title="Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Notifications;