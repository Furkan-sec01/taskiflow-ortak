import { useState } from "react";
import {
  FileText,
  FilePlus,
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  Edit3,
  Eye,
  Filter,
  Grid3X3,
  List,
  Star,
  StarOff,
  Clock,
  Tag,
  ChevronDown,
  File,
  FileSpreadsheet,
  Presentation,
  Image,
  Upload,
  FolderOpen,
} from "lucide-react";

type ViewMode = "grid" | "list";
type FilterType = "all" | "starred" | "recent";

interface Document {
  id: number;
  name: string;
  type: "pdf" | "doc" | "sheet" | "slide" | "image";
  size: string;
  updatedAt: string;
  starred: boolean;
  tags: string[];
  preview?: string;
}

const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Q1 2024 Report",
    type: "pdf",
    size: "2.4 MB",
    updatedAt: "2 saat önce",
    starred: true,
    tags: ["rapor", "finans"],
  },
  {
    id: 2,
    name: "Proje Planı",
    type: "sheet",
    size: "1.1 MB",
    updatedAt: "Dün",
    starred: false,
    tags: ["proje"],
  },
  {
    id: 3,
    name: "Sunum Taslağı",
    type: "slide",
    size: "5.8 MB",
    updatedAt: "3 gün önce",
    starred: true,
    tags: ["sunum"],
  },
  {
    id: 4,
    name: "Sözleşme v2",
    type: "doc",
    size: "340 KB",
    updatedAt: "1 hafta önce",
    starred: false,
    tags: ["hukuk"],
  },
  {
    id: 5,
    name: "Logo Görselleri",
    type: "image",
    size: "8.2 MB",
    updatedAt: "2 hafta önce",
    starred: false,
    tags: ["tasarım"],
  },
  {
    id: 6,
    name: "Bütçe Tablosu",
    type: "sheet",
    size: "920 KB",
    updatedAt: "3 hafta önce",
    starred: true,
    tags: ["finans", "bütçe"],
  },
];

const fileIcons: Record<Document["type"], { icon: React.ElementType; color: string; bg: string }> = {
  pdf: { icon: FileText, color: "#ef4444", bg: "#fef2f2" },
  doc: { icon: File, color: "#3b82f6", bg: "#eff6ff" },
  sheet: { icon: FileSpreadsheet, color: "#22c55e", bg: "#f0fdf4" },
  slide: { icon: Presentation, color: "#f97316", bg: "#fff7ed" },
  image: { icon: Image, color: "#a855f7", bg: "#faf5ff" },
};

const fileTypeLabels: Record<Document["type"], string> = {
  pdf: "PDF",
  doc: "Word",
  sheet: "Excel",
  slide: "Sunu",
  image: "Görsel",
};

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [docs, setDocs] = useState<Document[]>(mockDocuments);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const toggleStar = (id: number) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d))
    );
  };

  const deleteDoc = (id: number) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setActiveMenu(null);
  };

  const filtered = docs.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "starred") return matchSearch && d.starred;
    if (filter === "recent")
      return matchSearch && ["saat", "Dün"].some((k) => d.updatedAt.includes(k));
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-gray-900 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Belgeler</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{docs.length} belge</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <FilePlus size={16} />
          Yeni Belge
        </button>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Belge ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 gap-0.5">
            {(["all", "starred", "recent"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {f === "all" ? "Tümü" : f === "starred" ? "★ Yıldızlı" : "Son"}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              }`}
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          className={`mb-6 border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all cursor-pointer ${
            isDragging
              ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Upload size={18} className="text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Dosyaları buraya sürükleyin veya{" "}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">seçin</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">PDF, Word, Excel, Sunu, Görseller desteklenir</p>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <FolderOpen size={28} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Belge bulunamadı</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {search ? "Arama kriterlerini değiştirin" : "Henüz belge yüklenmemiş"}
            </p>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((doc) => {
              const { icon: Icon, color, bg } = fileIcons[doc.type];
              return (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleStar(doc.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {doc.starred ? (
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                        ) : (
                          <StarOff size={14} className="text-gray-400 dark:text-gray-500" />
                        )}
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === doc.id ? null : doc.id)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal size={14} className="text-gray-400 dark:text-gray-500" />
                        </button>
                        {activeMenu === doc.id && (
                          <div className="absolute right-0 top-6 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 w-36">
                            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <Eye size={12} /> Görüntüle
                            </button>
                            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <Download size={12} /> İndir
                            </button>
                            <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <Edit3 size={12} /> Yeniden adlandır
                            </button>
                            <hr className="my-1 border-gray-100 dark:border-gray-700" />
                            <button
                              onClick={() => deleteDoc(doc.id)}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={12} /> Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate mb-1">{doc.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    {fileTypeLabels[doc.type]} · {doc.size}
                  </p>

                  {/* Tags */}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 mt-auto">
                    <Clock size={10} className="text-gray-300 dark:text-gray-600" />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{doc.updatedAt}</span>
                    {doc.starred && (
                      <Star size={10} className="text-amber-400 fill-amber-400 ml-auto" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && filtered.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 font-medium">
              <span>Ad</span>
              <span>Tür</span>
              <span>Boyut</span>
              <span>Güncelleme</span>
              <span></span>
            </div>
            {filtered.map((doc, i) => {
              const { icon: Icon, color, bg } = fileIcons[doc.type];
              return (
                <div
                  key={doc.id}
                  className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${
                    i !== filtered.length - 1 ? "border-b border-gray-50 dark:border-gray-700/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.name}</span>
                    {doc.starred && <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{fileTypeLabels[doc.type]}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{doc.updatedAt}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleStar(doc.id)}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {doc.starred ? (
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                      ) : (
                        <StarOff size={13} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Download size={13} className="text-gray-400 dark:text-gray-500" />
                    </button>
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenu !== null && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}