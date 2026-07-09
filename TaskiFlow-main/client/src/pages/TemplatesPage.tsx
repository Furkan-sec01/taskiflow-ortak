import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code,
  PieChart,
  CheckSquare,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";

type TemplateDesign = {
  boardBg: string;
  columnBg: string;
  columnHeader: string;
};

type Template = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  columns: string[];
  design: TemplateDesign;
};

const PROJECT_TEMPLATES: Template[] = [
  {
    id: "software-dev",
    title: "Yazılım Geliştirme",
    description: "Agile/Scrum süreçlerine uygun: Backlog'dan Bittiye tam takip.",
    icon: <Code className="w-6 h-6" />,
    color: "blue",
    columns: ["Gereksinimler", "Backlog", "Geliştirme", "Test", "Bitti"],
    design: {
      boardBg: "bg-gradient-to-br from-indigo-500 to-cyan-500",
      columnBg: "bg-white",
      columnHeader: "text-indigo-700",
    },
  },
  {
    id: "marketing",
    title: "Pazarlama Kampanyası",
    description: "İçerik planlama ve sosyal medya stratejileri için ideal.",
    icon: <PieChart className="w-6 h-6" />,
    color: "purple",
    columns: ["Fikirler", "Tasarım", "İnceleme", "Yayında"],
    design: {
      boardBg: "bg-gradient-to-br from-purple-500 to-pink-500",
      columnBg: "bg-purple-50",
      columnHeader: "text-purple-700",
    },
  },
  {
    id: "personal-todo",
    title: "Kişisel Takip",
    description: "Günlük işlerinizi organize etmek için sade ve etkili.",
    icon: <CheckSquare className="w-6 h-6" />,
    color: "emerald",
    columns: ["Yapılacaklar", "Yapılıyor", "Tamamlandı"],
    design: {
      boardBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
      columnBg: "bg-white",
      columnHeader: "text-emerald-700",
    },
  }
];

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelectTemplate = async (template: Template) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Lütfen giriş yapın.");

    try {
      setLoadingId(template.id);

      const response = await fetch(
        "http://localhost:5000/api/project/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `${template.title} Projem`,
            description: template.description,
            initialColumns: template.columns,
            design: template.design,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.project?.id) {
        navigate(`/projects/${data.project.id}`);
      } else {
        alert(data.error || "Şablon oluşturulamadı.");
      }
    } catch (err) {
      console.error("Template Error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-gray-900 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm mb-4">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            TaskiFlow Şablonları
          </span>
        </div>

        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase mb-2">
          Hızlı Başlangıç
        </h1>

        <p className="text-gray-500 dark:text-gray-400 font-medium">
          İş akışınıza en uygun şablonu seçin.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PROJECT_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-xl transition-all"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${tpl.color}-50 text-${tpl.color}-600`}
            >
              {tpl.icon}
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-3 uppercase">
              {tpl.title}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 font-medium">
              {tpl.description}
            </p>

            {/* Board Preview */}
            <div
              className={`rounded-xl p-3 mb-6 flex gap-2 overflow-hidden ${tpl.design.boardBg}`}
            >
              {tpl.columns.slice(0, 3).map((col) => (
                <div
                  key={col}
                  className={`flex-1 ${tpl.design.columnBg} rounded-lg p-2`}
                >
                  <div
                    className={`text-[9px] font-bold ${tpl.design.columnHeader}`}
                  >
                    {col}
                  </div>
                </div>
              ))}
            </div>

            <button
              disabled={loadingId === tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className="w-full bg-gray-900 dark:bg-gray-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {loadingId === tpl.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Şablonu Uygula <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;