import { afterEach, describe, expect, it, vi } from 'vitest'
import { drawDay } from './draw.ts'
import { mulberry32 } from './rng.ts'
import { testPool } from './testPool.ts'
import type { Customer } from './types.ts'

const SEEDS = Array.from({ length: 1000 }, (_, i) => i + 1)

const ids = (day: readonly Customer[]) => day.map((c) => c.id)
const scamCount = (day: Customer[]) => day.filter((c) => c.truth === 'scam').length

describe('drawDay (requirements section 6, AC-5.1 to AC-5.3)', () => {
  const pool = testPool(4, 6)
  const days = SEEDS.map((seed) => drawDay(pool, mulberry32(seed)))

  it('gives 6 different customers from the pool on every day (AC-5.1)', () => {
    const poolIds = new Set(ids(pool))
    for (const day of days) {
      expect(day).toHaveLength(6)
      expect(new Set(ids(day)).size).toBe(6)
      for (const id of ids(day)) expect(poolIds.has(id)).toBe(true)
    }
  })

  it('gives 1, 2, or 3 scams, and each count between 250 and 420 times in 1,000 days (AC-5.1, rule 1)', () => {
    const counts = new Map<number, number>()
    for (const day of days) counts.set(scamCount(day), (counts.get(scamCount(day)) ?? 0) + 1)
    expect([...counts.keys()].sort()).toEqual([1, 2, 3])
    for (const k of [1, 2, 3]) {
      expect(counts.get(k)).toBeGreaterThanOrEqual(250)
      expect(counts.get(k)).toBeLessThanOrEqual(420)
    }
  })

  it('puts a scam in each of the 6 positions at least once (AC-5.2, rule 4)', () => {
    for (let position = 0; position < 6; position++) {
      expect(days.some((day) => day[position].truth === 'scam')).toBe(true)
    }
  })

  it('draws every customer in the pool at least once (rules 2 and 3)', () => {
    const drawn = new Set(days.flatMap(ids))
    expect([...drawn].sort()).toEqual(ids(pool).sort())
  })

  it('gives the same day for the same seed (AC-5.3)', () => {
    for (const seed of SEEDS.slice(0, 50)) {
      expect(ids(drawDay(pool, mulberry32(seed)))).toEqual(ids(drawDay(pool, mulberry32(seed))))
    }
  })

  // This pool has 4 × 6 + 6 × 15 + 4 × 20 = 194 sets of customers, each in
  // 720 orders: 139,680 days. Drawn uniformly, 1,000 days repeat about 5
  // times, so a draw that keeps giving the same few days fails here.
  it('gives at least 990 different days for 1,000 seeds (rule 6)', () => {
    expect(new Set(days.map((day) => ids(day).join(','))).size).toBeGreaterThanOrEqual(990)
  })

  it('gives a full day when the random source returns exactly 1', () => {
    const day = drawDay(pool, () => 1)
    const poolIds = new Set(ids(pool))
    expect(day).toHaveLength(6)
    for (const customer of day) expect(poolIds.has(customer?.id)).toBe(true)
    expect(new Set(ids(day)).size).toBe(6)
    expect(scamCount(day)).toBe(3)
  })

  it('works on the smallest valid pool of 3 and 5, and a 3-scam day uses all three scams (rule 7)', () => {
    const small = testPool(3, 5)
    const smallDays = SEEDS.map((seed) => drawDay(small, mulberry32(seed)))
    for (const day of smallDays) {
      expect(day).toHaveLength(6)
      expect(new Set(ids(day)).size).toBe(6)
      expect([1, 2, 3]).toContain(scamCount(day))
    }
    const threeScamDays = smallDays.filter((day) => scamCount(day) === 3)
    expect(threeScamDays.length).toBeGreaterThan(0)
    for (const day of threeScamDays) {
      expect(day.filter((c) => c.truth === 'scam').map((c) => c.id).sort()).toEqual(['s1', 's2', 's3'])
    }
  })

  it('throws on a pool below 3 scam and 5 legit, instead of giving a short day', () => {
    expect(() => drawDay(testPool(2, 5), mulberry32(1))).toThrow(/at least 3 scam and 5 legit/)
    expect(() => drawDay(testPool(3, 4), mulberry32(1))).toThrow(/at least 3 scam and 5 legit/)
  })

  it('does not change the pool array (rule 5)', () => {
    const frozen = Object.freeze(testPool(4, 6))
    const before = ids(frozen)
    for (const seed of SEEDS.slice(0, 20)) drawDay(frozen, mulberry32(seed))
    expect(ids(frozen)).toEqual(before)
  })

  describe('randomness', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('calls only the random source it is given (NFR-8)', () => {
      vi.spyOn(Math, 'random').mockImplementation(() => {
        throw new Error('drawDay called Math.random')
      })
      let calls = 0
      const source = mulberry32(7)
      const day = drawDay(pool, () => {
        calls++
        return source()
      })
      expect(day).toHaveLength(6)
      expect(calls).toBeGreaterThan(0)
    })
  })
})
