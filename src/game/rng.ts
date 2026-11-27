// A seeded random source for tests (AC-5.3, architecture.md T3). The app
// passes the browser's own random source to drawDay instead.

/** Mulberry32: a small 32-bit generator. Returns numbers in [0, 1), and the
 *  same seed always gives the same sequence. Not for anything secret. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
