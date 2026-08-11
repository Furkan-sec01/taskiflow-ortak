// Backend sunucu adresi. Deploy sırasında sadece client/.env dosyasındaki
// VITE_API_BASE_URL değerini değiştirmek yeterli.
export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");
