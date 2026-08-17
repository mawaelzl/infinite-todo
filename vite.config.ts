import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Project page served at https://mawaelzl.github.io/inifinte-todo/
  base: '/inifinte-todo/',
  plugins: [react()],
})
