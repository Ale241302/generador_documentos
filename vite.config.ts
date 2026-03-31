import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 'base' define la ruta raíz. Si se sirve en https://alterno.sclcargo.cl/ pondremos '/'
  // Si se sirve en una subcarpeta (ej: https://alterno.sclcargo.cl/reportes/), base sería '/reportes/'
  base: '/', 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Opcional: oculta el código fuente original en producción por seguridad
    chunkSizeWarningLimit: 1600, // Aumentado para evitar advertencias muy frecuentes
  }
})
