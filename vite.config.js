import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    exclude: ['sql.js']
  },
  resolve: {
    alias: {
      'sql.js': 'sql.js/dist/sql-wasm.js'
    }
  }
})
