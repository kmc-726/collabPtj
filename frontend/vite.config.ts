import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost', changeOrigin: true },
      '/ws':  { target: 'ws://localhost',  ws: true },
      '/oauth2':       { target: 'http://localhost', changeOrigin: true },
      '/login/oauth2': { target: 'http://localhost', changeOrigin: true },
    },
  },
});
