import React, { useEffect, useState } from "react";

type SessionItem = {
  id: string;
  deviceName: string;
  deviceType: "web" | "mobile";
  lastActive: string;
  current: boolean;
};

const ConnectedAccounts: React.FC = () => {
  const [devices, setDevices] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Oturumlar yüklenemedi.");
      setDevices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleLogout = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Oturum sonlandırılamadı.");
      setDevices((prev) => prev.filter((d) => d.id !== sessionId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Connected Accounts
        </h2>

        {loading ? (
          <p className="text-center text-gray-400">Yükleniyor...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <ul className="space-y-4">
            {devices.map((device) => (
              <li
                key={device.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl ${
                      device.deviceType === "web"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {device.deviceType === "web" ? "💻" : "📱"}
                  </div>

                  <div className="flex flex-col">
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm sm:text-base">
                      {device.deviceName}
                      {device.current && (
                        <span className="ml-2 text-xs text-green-600">(Bu cihaz)</span>
                      )}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                      Son aktif: {new Date(device.lastActive).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!device.current && (
                  <button
                    className="mt-3 sm:mt-0 sm:ml-4 px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-700 dark:hover:text-white transition text-sm font-semibold"
                    onClick={() => handleLogout(device.id)}
                  >
                    Logout
                  </button>
                )}
              </li>
            ))}

            {devices.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
                No connected devices found.
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConnectedAccounts;