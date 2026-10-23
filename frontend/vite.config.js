import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // todo lo que empiece con /api se lo pasa al backend.
    // asi el navegador cree que habla con el mismo origen y no hay problema de CORS
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
