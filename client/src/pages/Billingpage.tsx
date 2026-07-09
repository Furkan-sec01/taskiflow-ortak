import { useState } from "react";

/* ── Types ── */
type PlanKey = "starter" | "pro" | "corp";

interface Invoice {
  date: string;
  description: string;
  amount: string;
  status: string;
}

interface UsageStat {
  label: string;
  current: string;
  max?: string;
  unit?: string;
  percent: number;
  color: string;
}

interface Plan {
  key: PlanKey;
  label: string;
  badge: string;
  badgeStyle: string;
  price: string;
  priceNote: string;
  accentColor: string;
  pros: { text: string; tag?: "Plus" | "AI" }[];
  cons: string[];
  hint: {
    strong: string;
    text: string;
    btnLabel: string;
    target?: PlanKey;
    btnStyle: string;
  };
  usage: UsageStat[];
  invoices: Invoice[];
}

/* ── Data ── */
const plans: Plan[] = [
  {
    key: "starter",
    label: "Başlangıç",
    badge: "● Aktif Plan",
    badgeStyle: "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    price: "₺0",
    priceNote: "Süresiz ücretsiz",
    accentColor: "bg-blue-500",
    pros: [
      { text: "Tamamen ücretsiz, kart gerekmez" },
      { text: "Sınırsız görev oluşturma" },
      { text: "Temel destek dahil" },
      { text: "İstediğiniz zaman yükseltme" },
    ],
    cons: [
      "Yalnızca 2 proje",
      "50 MB depolama sınırı",
      "Ekip üyesi ekleyemezsiniz",
      "AI özellikleri yok",
    ],
    hint: {
      strong: "Profesyonel plana geçin",
      text: " — AI özellikleri, sınırsız proje ve ekip üyesiyle çok daha fazlası.",
      btnLabel: "Yükselt →",
      target: "pro",
      btnStyle: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    usage: [
      { label: "Projeler", current: "1", max: "2", percent: 50, color: "bg-blue-500" },
      { label: "Depolama", current: "38", max: "50", unit: "MB", percent: 76, color: "bg-amber-400" },
    ],
    invoices: [
      { date: "14 Oca 2025", description: "Başlangıç Planı", amount: "₺0,00", status: "Aktif" },
    ],
  },
  {
    key: "pro",
    label: "Profesyonel",
    badge: "★ Profesyonel",
    badgeStyle: "bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
    price: "₺349",
    priceNote: "Her ay 1'inde yenilenir",
    accentColor: "bg-gradient-to-r from-purple-500 to-blue-500",
    pros: [
      { text: "Sınırsız proje ve ekip üyesi" },
      { text: "10 GB depolama alanı" },
      { text: "Gelişmiş raporlar ve analitik" },
      { text: "Öncelikli destek hattı" },
      { text: "50 GB depolama", tag: "Plus" },
      { text: "Gelişmiş otomasyon kuralları", tag: "Plus" },
      { text: "AI Asistan (500 kredi/ay)", tag: "AI" },
      { text: "Otomatik görev etiketleme", tag: "AI" },
      { text: "Doğal dil ile arama", tag: "AI" },
      { text: "Akıllı raporlama", tag: "AI" },
    ],
    cons: [
      "Özel sunucu yok",
      "SLA garantisi yok",
      "Yönetici paneli yok",
      "7/24 canlı destek yok",
      "AI kredisi aylık sınırlı (500)",
    ],
    hint: {
      strong: "Şirketler planına geçin",
      text: " — Özel sunucu, SLA garantisi ve sınırsız AI kredisi için kurumsal pakete yükseltin.",
      btnLabel: "Yükselt →",
      target: "corp",
      btnStyle: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    usage: [
      { label: "Projeler", current: "∞", percent: 100, color: "bg-purple-500" },
      { label: "Depolama", current: "3.2", max: "50", unit: "GB", percent: 6, color: "bg-purple-500" },
      { label: "AI Kredisi", current: "320", max: "500", percent: 64, color: "bg-blue-400" },
      { label: "Otomasyon", current: "8", max: "25 kural", percent: 32, color: "bg-purple-400" },
    ],
    invoices: [
      { date: "1 Mar 2025", description: "Profesyonel Plan", amount: "₺349,00", status: "Ödendi" },
      { date: "1 Şub 2025", description: "Profesyonel Plan", amount: "₺349,00", status: "Ödendi" },
      { date: "1 Oca 2025", description: "Profesyonel Plan", amount: "₺349,00", status: "Ödendi" },
    ],
  },
  {
    key: "corp",
    label: "Şirketler",
    badge: "🏢 Kurumsal",
    badgeStyle: "bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
    price: "Özel",
    priceNote: "Yıllık fatura",
    accentColor: "bg-gradient-to-r from-orange-400 to-red-400",
    pros: [
      { text: "Sınırsız proje ve ekip üyesi" },
      { text: "Gelişmiş raporlar ve analitik" },
      { text: "Öncelikli destek hattı" },
      { text: "Sınırsız depolama", tag: "Plus" },
      { text: "Sınırsız otomasyon kuralları", tag: "Plus" },
      { text: "Sınırsız AI kredisi", tag: "AI" },
      { text: "Özel AI model fine-tuning", tag: "AI" },
      { text: "Tüm AI özellikleri dahil", tag: "AI" },
      { text: "Özel sunucu ve izole ortam" },
      { text: "%99.9 SLA uptime garantisi" },
      { text: "7/24 canlı destek hattı" },
      { text: "Tam yönetici paneli" },
    ],
    cons: [
      "Yüksek başlangıç maliyeti",
      "Yıllık taahhüt gereklidir",
      "Kurulum süreci gerektirir",
    ],
    hint: {
      strong: "Satış ekibiyle iletişime geçin",
      text: " — Organizasyonunuza özel fiyatlandırma ve kurulum için temsilcinizle görüşün.",
      btnLabel: "İletişime Geç →",
      btnStyle: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    usage: [
      { label: "Depolama", current: "∞", percent: 100, color: "bg-orange-400" },
      { label: "AI Kredisi", current: "∞", percent: 100, color: "bg-blue-400" },
      { label: "Uptime (Bu ay)", current: "99.98%", percent: 100, color: "bg-green-500" },
      { label: "Destek Yanıt", current: "< 1 saat", percent: 100, color: "bg-green-500" },
    ],
    invoices: [
      { date: "1 Oca 2025", description: "Kurumsal Plan (Yıllık)", amount: "Özel", status: "Aktif" },
    ],
  },
];

/* ── FeatureTag ── */
function FeatureTag({ tag }: { tag: "Plus" | "AI" }) {
  return tag === "Plus" ? (
    <span className="ml-1.5 inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 align-middle">
      Plus
    </span>
  ) : (
    <span className="ml-1.5 inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 align-middle">
      AI
    </span>
  );
}

/* ── UsageCard ── */
function UsageCard({ stat }: { stat: UsageStat }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-1.5">
        {stat.label}
      </p>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{stat.current}</span>
        {stat.max && (
          <>
            <span className="text-xs text-gray-400 dark:text-gray-500">{stat.unit ? `${stat.unit} /` : "/"}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{stat.max}</span>
          </>
        )}
        {!stat.max && stat.unit && (
          <span className="text-xs text-gray-400 dark:text-gray-500">{stat.unit}</span>
        )}
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${stat.color} transition-all duration-500`}
          style={{ width: `${stat.percent}%` }}
        />
      </div>
    </div>
  );
}

/* ── BillingPage ── */
export default function BillingPage() {
  const [active, setActive] = useState<PlanKey>("starter");
  const plan = plans.find((p) => p.key === active)!;

  return (
    <div className="min-h-screen bg-[#f0f4f9] dark:bg-gray-900 p-8">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Billing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Planınızı görüntüleyin, yönetin ve yükseltin.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 w-fit mb-6 shadow-sm">
        {plans.map((p) => (
          <button
            key={p.key}
            onClick={() => setActive(p.key)}
            className={`px-5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              active === p.key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Plan Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden mb-6">

        {/* Accent top bar */}
        <div className={`h-1 w-full ${plan.accentColor}`} />

        <div className="p-6">

          {/* Head */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className={`inline-flex items-center text-[11px] font-semibold px-3 py-1 rounded-full mb-3 ${plan.badgeStyle}`}>
                {plan.badge}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{plan.label}</h2>
            </div>
            <div className="text-right">
              <p className={`font-bold text-gray-900 dark:text-gray-100 ${plan.price.length > 4 ? "text-xl" : "text-3xl"}`}>
                {plan.price}
                {plan.key !== "corp" && (
                  <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> /ay</span>
                )}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{plan.priceNote}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex gap-8 pb-5 mb-5 border-b border-gray-100 dark:border-gray-700">
            {plan.key === "corp" ? (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-0.5">Sözleşme</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Yıllık</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-0.5">Müşteri Temsilcisi</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Atandı</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-0.5">SLA</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">%99.9 uptime</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-0.5">Plan Başlangıcı</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{plan.key === "starter" ? "14 Oca 2025" : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-0.5">Sonraki Ödeme</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{plan.key === "starter" ? "—" : "1 Nis 2025"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-0.5">Fatura Yöntemi</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{plan.key === "starter" ? "—" : "Kredi Kartı"}</p>
                </div>
              </>
            )}
          </div>

          {/* Pros / Cons */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3 flex items-center gap-1.5">
                <span>✓</span> Avantajlar
              </p>
              <ul className="flex flex-col gap-2">
                {plan.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    <span className="text-green-500 font-bold shrink-0 mt-0.5">+</span>
                    <span>
                      {pro.text}
                      {pro.tag && <FeatureTag tag={pro.tag} />}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-3 flex items-center gap-1.5">
                <span>✗</span> Dezavantajlar
              </p>
              <ul className="flex flex-col gap-2">
                {plan.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">−</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upgrade Hint */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong className="text-gray-900 dark:text-gray-100">{plan.hint.strong}</strong>
              {plan.hint.text}
            </p>
            <button
              onClick={() => plan.hint.target && setActive(plan.hint.target)}
              className={`shrink-0 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer ${plan.hint.btnStyle}`}
            >
              {plan.hint.btnLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Usage */}
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3">Kullanım Durumu</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {plan.usage.map((stat, i) => (
          <UsageCard key={i} stat={stat} />
        ))}
      </div>

      {/* Billing History */}
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3">Fatura Geçmişi</h3>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              {["Tarih", "Açıklama", "Tutar", "Durum", "Fatura"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plan.invoices.map((inv, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{inv.date}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{inv.description}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-gray-800 dark:text-gray-200">{inv.amount}</td>
                <td className="px-5 py-3.5">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {inv.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium cursor-pointer transition-colors">
                    İndir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}