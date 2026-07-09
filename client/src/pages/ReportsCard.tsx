import { useNavigate } from "react-router-dom";
import { BarChart2, ArrowRight, TrendingUp, GitPullRequest, Layers } from "lucide-react";

export default function ReportsCard() {
  const navigate = useNavigate();

  const items = [
    { icon: <TrendingUp size={14} />, label: "Burndown & Burnup" },
    { icon: <BarChart2 size={14} />, label: "Velocity & Sprint" },
    { icon: <Layers size={14} />, label: "Cumulative Flow" },
    { icon: <GitPullRequest size={14} />, label: "Pie & Age Report" },
  ];

  return (
    <div
      onClick={() => navigate("/reports")}
      className="group cursor-pointer bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <BarChart2 size={20} />
          </div>
          <div>
            <h3 className="font-700 text-slate-800 text-[15px] font-bold">Reports</h3>
            <p className="text-slate-400 text-xs mt-0.5">9 rapor · 3 kategori</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors duration-200">
          <ArrowRight size={15} className="text-slate-400 group-hover:text-white transition-colors duration-200" />
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-[13px] leading-relaxed mb-4">
        Sprint performansı, ekip hızı ve süreç darboğazlarını gerçek zamanlı grafiklerle analiz edin.
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[11px] font-medium"
          >
            {item.icon}
            {item.label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-blue-600 text-[13px] font-semibold group-hover:gap-3 transition-all duration-200">
        <span>Raporları Görüntüle</span>
        <ArrowRight size={14} />
      </div>
    </div>
  );
}