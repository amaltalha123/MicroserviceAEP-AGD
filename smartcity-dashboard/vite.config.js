import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['sourly-zincoid-shaina.ngrok-free.dev'],
    host: true,
    port: 5173,
    strictPort: true, // optionnel: échoue si le port est déjà pris
  },
})