import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/GLCVisits/',
  server: {
    proxy: {
      '/api': {
        target: 'https://souq.glcpaints.com:7781',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('[Proxy Request] URL:', req.url);
            console.log('[Proxy Request] Headers:', req.headers);
          });
        }
      },
    },
  },
})
