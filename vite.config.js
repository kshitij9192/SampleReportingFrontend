import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // root directory of index.html (slash for project root)
  publicDir: 'public', // your static assets directory
})
