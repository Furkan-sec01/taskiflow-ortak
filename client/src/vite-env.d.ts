/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend sunucu adresi, "/api" olmadan. Örn: http://localhost:5000 */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
