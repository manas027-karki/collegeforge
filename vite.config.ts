import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|react-smooth|d3-|victory-vendor)[\\/]/,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
            },
          ],
        },
      },
    },
  },
})