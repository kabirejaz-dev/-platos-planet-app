import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'chunk-charts'
          if (id.includes('framer-motion')) return 'chunk-motion'
          if (id.includes('@radix-ui')) return 'chunk-radix'
          if (id.includes('cmdk')) return 'chunk-cmdk'
          if (id.includes('react-dom') || id.includes('react-router')) return 'chunk-react'
          if (id.includes('zustand')) return 'chunk-state'
          if (id.includes('lucide-react')) return 'chunk-icons'

          return 'chunk-vendor'
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
