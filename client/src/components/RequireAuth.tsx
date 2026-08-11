import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Panel rotalarını saran kapı. Token yoksa sayfayı hiç render etmeden
 * /login'e gönderir.
 *
 * Bunun olmadığı durumda giriş yapmamış bir kullanıcı /dashboard'a doğrudan
 * gidebiliyordu: sayfa açılıyor, içindeki her fetch 401 dönüyor ve kullanıcı
 * ne olduğunu anlamadığı boş bir ekranda kalıyordu.
 *
 * NOT: Bu sadece bir kullanıcı deneyimi katmanı. Gerçek yetki kontrolü
 * sunucuda (authMiddleware) yapılır; localStorage'daki token'a güvenilmez.
 */
export default function RequireAuth() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    // state.from: giriş sonrası kullanıcıyı gitmek istediği sayfaya
    // döndürebilmek için saklıyoruz.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
