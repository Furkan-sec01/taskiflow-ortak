import React, { useEffect, useState } from "react";

type Device = {
  deviceId: string;
  deviceName: string;
  deviceType: "web" | "mobile";
  lastActive: string;
};

type Props = {
  userId: string;
};

const ConnectedAccounts: React.FC<Props> = ({ userId }) => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const mockDevices: Device[] = [
      {
        deviceId: "1",
        deviceName: "MacBook Pro",
        deviceType: "web",
        lastActive: new Date().toISOString(),
      },
      {
        deviceId: "2",
        deviceName: "iPhone 14",
        deviceType: "mobile",
        lastActive: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
      {
        deviceId: "3",
        deviceName: "Windows Chrome",
        deviceType: "web",
        lastActive: new Date(Date.now() - 7200 * 1000).toISOString(),
      },
    ];
    setDevices(mockDevices);
  }, [userId]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Connected Accounts
        </h2>

        <ul className="space-y-4">
          {devices.map((device) => (
            <li
              key={device.deviceId}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex items-center space-x-4">
                {/* Device Icon */}
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
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    Last active: {new Date(device.lastActive).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                className="mt-3 sm:mt-0 sm:ml-4 px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-700 dark:hover:text-white transition text-sm font-semibold"
                onClick={() =>
                  setDevices((prev) =>
                    prev.filter((d) => d.deviceId !== device.deviceId)
                  )
                }
              >
                Logout
              </button>
            </li>
          ))}

          {devices.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
              No connected devices found.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ConnectedAccounts;