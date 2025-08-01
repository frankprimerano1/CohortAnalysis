import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  base: '/cohort-analysis-tool/', // Replace with your repo name
  build: {
    outDir: 'dist'
  }
})