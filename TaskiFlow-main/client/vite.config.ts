import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend'i Backend'e (Port 5000) Tünel ile Bağlıyoruz
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
