import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  /**
   * Where the dev and preview servers forward `/api`.
   *
   * Proxying means the browser only ever talks to one origin, so there is no
   * CORS negotiation and the session cookie behaves like a same-site request.
   * It also removes the `localhost` vs `127.0.0.1` trap: both resolve to the
   * same server, and the API never sees a browser origin it has to be told
   * about.
   */
  const proxy = {
    '/api': {
      target: env.VITE_PROXY_TARGET ?? 'http://localhost:5000',
      changeOrigin: false,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
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
