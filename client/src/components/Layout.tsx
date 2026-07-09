import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useTheme } from "../context/ThemeContext";

export default function Layout() {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? "dark" : ""}>
      {/* Sidebar fixed, ana içerik margin-left ile kaydırıldı */}
      <Sidebar />
      <main className="ml-[220px] min-h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}