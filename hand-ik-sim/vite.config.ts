import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/cloud_agents/hand-ik/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5174,
  },
})
