import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      /**
       * Proxies `/api` to the backend during development.
       *
       * The browser then talks to a single origin, so there is no CORS
       * negotiation and the session cookie behaves exactly like a same-site
       * request. It also removes the `localhost` vs `127.0.0.1` trap: both
       * resolve to the same dev server, and the API never sees a browser
       * origin it has to be told about.
       */
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET ?? 'http://localhost:5000',
          changeOrigin: false,
        },
      },
    },
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
  }
})
