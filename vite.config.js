import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    // Opcional en desarrollo: con VITE_API_URL=/api/v1 las llamadas pasan por este proxy
    // y el navegador no necesita CORS en el Gateway.
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } }
  }
})
