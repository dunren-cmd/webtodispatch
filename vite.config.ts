import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_APP_PORT || '3050', 10),
    host: process.env.VITE_APP_HOST || '0.0.0.0',
    open: true
  }
})

