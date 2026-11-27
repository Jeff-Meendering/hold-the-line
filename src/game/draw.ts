// The day draw: rules 1 to 7 in requirements.md section 6 (D3). The random
// source comes in as a parameter, so the same seed gives the same day and
// this file stays pure (NFR-8, architecture.md T3).
import type { Customer } from './types.ts'

export const DAY_LENGTH = 6
const MIN_SCAMS = 1
const MAX_SCAMS = 3

/** A whole number from 0 to n - 1. The clamp keeps a source that returns
 *  exactly 1 from reading past the end of an array. */
function randomIndex(rng: () => number, n: number): number {
  return Math.min(n - 1, Math.floor(rng() * n))
}

/** Shuffles a copy of the list with Fisher–Yates and keeps the first `count`.
 *  With count equal to the length, it is a uniform shuffle of the whole list. */
function pick<T>(list: readonly T[], count: number, rng: () => number): T[] {
  const copy = [...list]
  for (let i = 0; i < count; i++) {
    const j = i + randomIndex(rng, copy.length - i)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

/**
 * Draws one day of 6 different customers from the pool:
 * 1. the scam count k is 1, 2, or 3, each with probability 1/3;
 * 2. k different scam customers, each equally likely;
 * 3. 6 - k different legit customers, each equally likely;
 * 4. the 6 in a uniformly random order.
 * The pool is not changed. It needs at least 3 scam and 5 legit customers
 * (rule 7, checked by validateData as V10), and drawDay throws if it has fewer.
 */
export function drawDay(pool: readonly Customer[], rng: () => number): Customer[] {
  const scams = pool.filter((c) => c.truth === 'scam')
  const legit = pool.filter((c) => c.truth === 'legit')
  if (scams.length < MAX_SCAMS || legit.length < DAY_LENGTH - MIN_SCAMS) {
    throw new Error(
      `drawDay needs at least ${MAX_SCAMS} scam and ${DAY_LENGTH - MIN_SCAMS} legit customers, ` +
        `and the pool has ${scams.length} and ${legit.length}`,
    )
  }
  const k = MIN_SCAMS + randomIndex(rng, MAX_SCAMS - MIN_SCAMS + 1)
  const day = [...pick(scams, k, rng), ...pick(legit, DAY_LENGTH - k, rng)]
  return pick(day, day.length, rng)
}
