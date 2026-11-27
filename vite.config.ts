import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // The site is served from https://jeff-meendering.github.io/hold-the-line/
  base: '/hold-the-line/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
