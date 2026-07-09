import { useState, useEffect } from "react";
import {
  FileText, FilePlus, Search, MoreHorizontal, Download,
  Trash2, Edit3, Eye, Grid3X3, List, Star, StarOff,
  Clock, Upload, FolderOpen, File, FileSpreadsheet, Presentation, Image,
} from "lucide-react";

type ViewMode = "grid" | "list";
type FilterType = "all" | "starred" | "recent";

export interface OrgDocument {
  id: string;
  name: string;
  type: "pdf" | "doc" | "sheet" | "slide" | "image";
  size: string;
  updatedAt: string;
  starred: boolean;
  tags: string[];
  orgId: string;
}

const fileIcons: Record<OrgDocument["type"], { icon: React.ElementType; color: string; bg: string }> = {
  pdf:   { icon: FileText,        color: "#ef4444", bg: "#fef2f2" },
  doc:   { icon: File,            color: "#3b82f6", bg: "#eff6ff" },
  sheet: { icon: FileSpreadsheet, color: "#22c55e", bg: "#f0fdf4" },
  slide: { icon: Presentation,    color: "#f97316", bg: "#fff7ed" },
  image: { icon: Image,           color: "#a855f7", bg: "#faf5ff" },
};

const fileTypeLabels: Record<OrgDocument["type"], string> = {
  pdf: "PDF", doc: "Word", sheet: "Excel", slide: "Sunu", image: "Görsel",
};

const STORAGE_KEY = "org_documents";

function loadDocs(): OrgDocument[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveDocs(docs: OrgDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

// ---------- Yeni Belge Modalı ----------
interface NewDocModalProps {
  orgId: string;
  onClose: () => void;
  onSave: (doc: OrgDocument) => void;
}

function NewDocModal({ orgId, onClose, onSave }: NewDocModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<OrgDocument["type"]>("doc");
  const [tag, setTag] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      id: Date.now().toString(),
      name: name.trim(),
      type,
      size: "—",
      updatedAt: "Az önce",
      starred: false,
      tags: tag.trim() ? [tag.trim()] : [],
      orgId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Yeni Belge</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Belge Adı</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Belge adı girin..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Tür</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OrgDocument["type"])}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {(Object.keys(fileTypeLabels) as OrgDocument["type"][]).map((t) => (
                <option key={t} value={t}>{fileTypeLabels[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Etiket (opsiyonel)</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="örn. rapor, finans..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Ana Bileşen ----------
interface DocumentsTabProps {
  orgId: string;
}

export default function DocumentsTab({ orgId }: DocumentsTabProps) {
  const [allDocs, setAllDocs] = useState<OrgDocument[]>(loadDocs);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Sadece bu org'a ait belgeler
  const docs = allDocs.filter((d) => d.orgId === orgId);

  useEffect(() => { saveDocs(allDocs); }, [allDocs]);

  const addDoc = (doc: OrgDocument) => setAllDocs((prev) => [doc, ...prev]);

  const toggleStar = (id: string) =>
    setAllDocs((prev) => prev.map((d) => d.id === id ? { ...d, starred: !d.starred } : d));

  const deleteDoc = (id: string) => {
    setAllDocs((prev) => prev.filter((d) => d.id !== id));
    setActiveMenu(null);
  };

  const confirmRename = (id: string) => {
    if (editingName.trim())
      setAllDocs((prev) =>
        prev.map((d) => d.id === id ? { ...d, name: editingName.trim(), updatedAt: "Az önce" } : d)
      );
    setEditingId(null);
  };

  const filtered = docs.filter((d) => {
    const m = d.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "starred") return m && d.starred;
    if (filter === "recent") return m && d.updatedAt.includes("önce");
    return m;
  });

  return (
    <div className="mt-2">
      {showModal && (
        <NewDocModal orgId={orgId} onClose={() => setShowModal(false)} onSave={addDoc} />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Belge ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
          />
        </div>
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
        <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 gap-0.5">
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${
            viewMode === "grid" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
          }`}>
            <Grid3X3 size={14} />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${
            viewMode === "list" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
          }`}>
            <List size={14} />
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FilePlus size={15} /> Yeni Belge
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
        className={`mb-6 border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 transition-all cursor-pointer ${
          isDragging
            ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
          <Upload size={16} className="text-blue-500 dark:text-blue-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          Dosyaları buraya sürükleyin veya{" "}
          <span className="text-blue-600 dark:text-blue-400 hover:underline">seçin</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">PDF, Word, Excel, Sunu, Görseller desteklenir</p>
      </div>

      {/* Boş durum */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <FolderOpen size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">Belge bulunamadı</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {search ? "Arama kriterlerini değiştirin" : "Henüz belge eklenmemiş"}
          </p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
            + İlk belgeyi ekle
          </button>
        </div>
      )}

      {/* Grid görünüm */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((doc) => {
            const { icon: Icon, color, bg } = fileIcons[doc.type];
            return (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleStar(doc.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      {doc.starred ? <Star size={13} className="text-amber-400 fill-amber-400" /> : <StarOff size={13} className="text-gray-400 dark:text-gray-500" />}
                    </button>
                    <div className="relative">
                      <button onClick={() => setActiveMenu(activeMenu === doc.id ? null : doc.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MoreHorizontal size={13} className="text-gray-400 dark:text-gray-500" />
                      </button>
                      {activeMenu === doc.id && (
                        <div className="absolute right-0 top-6 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 w-40">
                          <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"><Eye size={12} /> Görüntüle</button>
                          <button className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"><Download size={12} /> İndir</button>
                          <button
                            onClick={() => { setEditingId(doc.id); setEditingName(doc.name); setActiveMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit3 size={12} /> Yeniden adlandır
                          </button>
                          <hr className="my-1 border-gray-100 dark:border-gray-700" />
                          <button onClick={() => deleteDoc(doc.id)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 size={12} /> Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {editingId === doc.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => confirmRename(doc.id)}
                    onKeyDown={(e) => { if (e.key === "Enter") confirmRename(doc.id); if (e.key === "Escape") setEditingId(null); }}
                    className="w-full text-sm font-medium border border-blue-400 rounded px-1 py-0.5 outline-none mb-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate mb-1">{doc.name}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{fileTypeLabels[doc.type]} · {doc.size}</p>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[10px]">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-gray-300 dark:text-gray-600" />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{doc.updatedAt}</span>
                  {doc.starred && <Star size={10} className="text-amber-400 fill-amber-400 ml-auto" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Liste görünüm */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 font-medium">
            <span>Ad</span><span>Tür</span><span>Boyut</span><span>Güncelleme</span><span></span>
          </div>
          {filtered.map((doc, i) => {
            const { icon: Icon, color, bg } = fileIcons[doc.type];
            return (
              <div key={doc.id} className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${i !== filtered.length - 1 ? "border-b border-gray-50 dark:border-gray-700" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  {editingId === doc.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => confirmRename(doc.id)}
                      onKeyDown={(e) => { if (e.key === "Enter") confirmRename(doc.id); if (e.key === "Escape") setEditingId(null); }}
                      className="text-sm font-medium border border-blue-400 rounded px-1 py-0.5 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.name}</span>
                  )}
                  {doc.starred && <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{fileTypeLabels[doc.type]}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{doc.updatedAt}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleStar(doc.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    {doc.starred ? <Star size={13} className="text-amber-400 fill-amber-400" /> : <StarOff size={13} className="text-gray-400 dark:text-gray-500" />}
                  </button>
                  <button onClick={() => { setEditingId(doc.id); setEditingName(doc.name); }} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Edit3 size={13} className="text-gray-400 dark:text-gray-500" />
                  </button>
                  <button onClick={() => deleteDoc(doc.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeMenu !== null && <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />}
    </div>
  );
}