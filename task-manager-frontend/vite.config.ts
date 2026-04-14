import react from '@vitejs/plugin-react'

export default {
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: '100.107.19.52',
      port: 3000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
  base: '/',
}
