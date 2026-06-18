import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    testTimeout: 15000,
    exclude: ['**/node_modules/**', '**/api.test.js'],
  },
})
