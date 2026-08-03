// Plan kodları, etiketleri ve fiyatları.
// DİKKAT: Fiyatlar sunucudaki planPrices ile birebir aynı olmak zorunda
// (server/src/controllers/paymentController.js). Ücret sunucuda hesaplanır,
// buradaki değerler yalnızca ekranda gösterilir; ikisi ayrışırsa kullanıcıya
// gösterilen tutar ile çekilen tutar farklı olur.
export type PlanCode = "FREE" | "PRO" | "BUSINESS";

export const PLAN_PRICES: Record<PlanCode, number> = {
  FREE: 0,
  PRO: 99,
  BUSINESS: 499,
};

export const PLAN_LABELS: Record<PlanCode, string> = {
  FREE: "Başlangıç",
  PRO: "Profesyonel",
  BUSINESS: "Şirketler",
};

// Ödeme sayfasına yalnızca bu planlar için gidilir. FREE ücretsiz olduğu için
// 3D Secure akışına girmez, BUSINESS ise özel fiyatlandırma sebebiyle
// /contact üzerinden ilerler.
export const isPurchasablePlan = (code: PlanCode): boolean => code === "PRO";

export const isPlanCode = (value: string | null): value is PlanCode =>
  value === "FREE" || value === "PRO" || value === "BUSINESS";
