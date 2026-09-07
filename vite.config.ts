import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Only generate bundle report when running: pnpm run analyze
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'dist/bundle-report.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react-core'
          if (id.includes('/react-router')) return 'react-router'
          if (id.includes('/@tanstack/react-query/')) return 'react-query'
          if (id.includes('/@supabase/')) return 'supabase'
          if (
            id.includes('/react-hook-form/')
            || id.includes('/@hookform/resolvers/')
            || id.includes('/zod/')
          ) return 'forms'
          return undefined
        },
      },
    },
  },
}))
