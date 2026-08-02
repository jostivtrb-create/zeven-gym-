import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Respeta el puerto que asigne el entorno (herramientas de preview, contenedores…)
  server: { port: Number(process.env.PORT) || 5173 },
})
