import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// SEC-12 and D25. Added to the built index.html only, because the dev server
// needs inline script and the policy would block it.
const CONTENT_SECURITY_POLICY =
  "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'"

function contentSecurityPolicy(): Plugin {
  return {
    name: 'hold-the-line-csp',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

export default defineConfig({
  // The site is served from https://jeff-meendering.github.io/hold-the-line/
  base: '/hold-the-line/',
  plugins: [react(), contentSecurityPolicy()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
