import { expect, it } from 'vitest'

// MT-24 (AC-8.2, FR-16, D29): a test that fails on purpose, merged into main
// to show that a failing test stops the deploy. It is reverted straight after.
it('fails on purpose for MT-24', () => {
  expect(1 + 1).toBe(3)
})
