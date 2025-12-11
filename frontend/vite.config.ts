import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Heladeria-Simple-Project/',
  plugins: [react()],
  
  build: {
    // Optimización de chunks para mejor caché
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks separados
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'tanstack-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'ui-vendor': ['react-hot-toast', 'react-icons'],
        },
      },
    },
    // Optimización de tamaño
    minify: 'esbuild', // esbuild es más rápido que terser
    // Aumentar límite de advertencia de chunk (opcional)
    chunkSizeWarningLimit: 1000,
    // Source maps solo para debugging
    sourcemap: false,
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
  
  // Performance en desarrollo
  server: {
    hmr: {
      overlay: true,
    },
  },
})


