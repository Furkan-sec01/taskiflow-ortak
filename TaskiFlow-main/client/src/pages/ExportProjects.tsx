import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Project {
  id: string | number;
  title: string;
  description: string;
  members?: Member[];
  organization?: {
    id?: string;
    name: string;
  };
}

const ExportProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  
  const [selectedProjectIds, setSelectedProjectIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Giriş yapmanız gerekiyor.");

        const response = await fetch("http://localhost:5000/api/project/my-projects", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Projeler alınamadı.");

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleProjectSelection = (id: string | number) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProjectIds.length === projects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(projects.map((p) => p.id));
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportPDF = (targetProjects: Project[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Seçili Projeler", 14, 20);
    doc.setFontSize(12);

    let y = 30;
    targetProjects.forEach((p, index) => {
      doc.text(`${index + 1}. ${p.title}`, 14, y);
      y += 7;
      doc.text(`Açıklama: ${p.description || "Yok"}`, 14, y);
      y += 7;
      doc.text(`Üyeler: ${(p.members || []).map(m => m.name).join(", ") || "Yok"}`, 14, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("selected_projects.pdf");
  };

  const handleExport = (format: "json" | "csv" | "pdf") => {
    // Sadece seçili olan projeleri filtrele
    const targetProjects = projects.filter((p) => selectedProjectIds.includes(p.id));
    
    if (targetProjects.length === 0) return;
    setExporting(format);

    setTimeout(() => {
      if (format === "json") {
        downloadFile(JSON.stringify(targetProjects, null, 2), "projects.json", "application/json");
      } else if (format === "csv") {
        const headers = ["ID", "Title", "Description", "Members"];
        const rows = targetProjects.map(p => [
          p.id,
          `"${p.title}"`,
          `"${p.description}"`,
          `"${(p.members || []).map(m => m.name).join("; ")}"`
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        downloadFile(csvContent, "projects.csv", "text/csv");
      } else if (format === "pdf") {
        exportPDF(targetProjects);
      }

      setExporting(null);
    }, 500);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Projeleri Dışa Aktar</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Dışa aktarmak istediğiniz projeleri seçin ({selectedProjectIds.length} seçili).
            </p>
          </div>
          
          {projects.length > 0 && (
            <button 
              onClick={toggleSelectAll}
              className="mt-4 sm:mt-0 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {selectedProjectIds.length === projects.length ? "Seçimi Kaldır" : "Tümünü Seç"}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-gray-200/50 dark:bg-gray-700/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow text-red-500 text-center mb-6">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-400 text-center mb-6">
            Görüntülenecek proje bulunamadı.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {projects.map((project) => {
              const isSelected = selectedProjectIds.includes(project.id);
              return (
                <li
                  key={project.id}
                  onClick={() => toggleProjectSelection(project.id)}
                  className={`relative cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow transition flex flex-col justify-between border-2 ${
                    isSelected 
                    ? "border-blue-500 ring-2 ring-blue-500/20" 
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="absolute top-3 right-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-gray-700 border-gray-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 pr-6">{project.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                      {project.description || "Açıklama yok."}
                    </p>
                  </div>
                  <div className="mt-4 text-xs text-gray-400 dark:text-gray-300">
                    Üyeler: {project.members?.length || 0}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          {["json", "csv", "pdf"].map((format) => (
            <button
              key={format}
              // BUTON KONTROLÜ: Eğer hiçbir şey seçili değilse veya işlem sürüyorsa disabled olur
              disabled={!!exporting || selectedProjectIds.length === 0}
              onClick={() => handleExport(format as "json" | "csv" | "pdf")}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
                selectedProjectIds.length === 0
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50"
                  : exporting === format
                  ? "bg-gray-400 animate-pulse"
                  : format === "json"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : format === "csv"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {exporting === format
                ? `${format.toUpperCase()} Hazırlanıyor...`
                : format === "pdf"
                ? "Seçilileri PDF Yap"
                : `${format.toUpperCase()} İndir`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportProjects;