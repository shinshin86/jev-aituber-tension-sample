import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// As of 2026-09 api.typesafe.ai rejects browser preflights ("Disallowed CORS
// origin", localhost included), so both Vite servers proxy this path
// and omit the browser's Origin header before forwarding upstream.
const typeSafeProxy = {
  target: 'https://api.typesafe.ai',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/typesafe/, ''),
  configure(proxy) {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.removeHeader('origin')
    })
  },
} satisfies ProxyOptions

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api/typesafe': typeSafeProxy },
  },
  preview: {
    proxy: { '/api/typesafe': typeSafeProxy },
  },
})
