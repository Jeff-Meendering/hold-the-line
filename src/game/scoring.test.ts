import { describe, expect, it } from 'vitest'
import { pointsFor, scoreDay, sumPoints } from './scoring.ts'
import { legit, scam } from './testPool.ts'
import type { Customer, CustomerResult, Decision } from './types.ts'

/** A day of 6 with scams at the given positions and legit customers elsewhere. */
function dayWithScamsAt(positions: number[]): Customer[] {
  return Array.from({ length: 6 }, (_, i) => (positions.includes(i) ? scam(`s${i}`) : legit(`l${i}`)))
}

const results = (decisions: Decision[]): CustomerResult[] => decisions.map((decision) => ({ asked: [], decision }))

/** The right call for each customer, with the positions in `wrong` flipped. */
function calls(day: Customer[], wrong: number[] = []): Decision[] {
  return day.map((c, i) => {
    const right: Decision = c.truth === 'scam' ? 'hold' : 'process'
    if (!wrong.includes(i)) return right
    return right === 'hold' ? 'process' : 'hold'
  })
}

/** Every set of `size` positions out of 0 to 5. */
function choose(size: number, from = 0): number[][] {
  if (size === 0) return [[]]
  const out: number[][] = []
  for (let i = from; i < 6; i++) for (const rest of choose(size - 1, i + 1)) out.push([i, ...rest])
  return out
}

/** All 64 ways to decide 6 customers. */
const ALL_DECISIONS: Decision[][] = Array.from({ length: 64 }, (_, bits) =>
  Array.from({ length: 6 }, (_, i) => ((bits >> i) & 1 ? 'hold' : 'process')),
)

describe('pointsFor (requirements section 5)', () => {
  it('scores the four rows of the table', () => {
    expect(pointsFor('legit', 'process')).toBe(10)
    expect(pointsFor('scam', 'hold')).toBe(10)
    expect(pointsFor('legit', 'hold')).toBe(-5)
    expect(pointsFor('scam', 'process')).toBe(-20)
  })
})

describe('scoreDay (requirements section 5, AC-6.1)', () => {
  it('gives every example in requirements section 5', () => {
    const oneScam = dayWithScamsAt([2])
    const twoScams = dayWithScamsAt([0, 4])
    const threeScams = dayWithScamsAt([1, 3, 5])
    const processAll = results(Array(6).fill('process'))
    const holdAll = results(Array(6).fill('hold'))

    expect(scoreDay(twoScams, results(calls(twoScams)))).toBe(60) // perfect day
    expect(scoreDay(twoScams, results(calls(twoScams, [1])))).toBe(45) // one legit held
    expect(scoreDay(twoScams, results(calls(twoScams, [0])))).toBe(30) // one scam let through
    expect(scoreDay(twoScams, results(calls(twoScams, [0, 1])))).toBe(15) // one of each

    expect(scoreDay(oneScam, processAll)).toBe(30)
    expect(scoreDay(twoScams, processAll)).toBe(0)
    expect(scoreDay(threeScams, processAll)).toBe(0)

    expect(scoreDay(oneScam, holdAll)).toBe(0)
    expect(scoreDay(twoScams, holdAll)).toBe(0)
    expect(scoreDay(threeScams, holdAll)).toBe(15)
  })

  it('matches max(0, 60 − 30 × scams processed − 15 × legit held) for every scam placement and all 64 sets of decisions', () => {
    let cases = 0
    for (const k of [1, 2, 3]) {
      for (const positions of choose(k)) {
        const day = dayWithScamsAt(positions)
        for (const decisions of ALL_DECISIONS) {
          const scamsProcessed = day.filter((c, i) => c.truth === 'scam' && decisions[i] === 'process').length
          const legitHeld = day.filter((c, i) => c.truth === 'legit' && decisions[i] === 'hold').length
          const score = scoreDay(day, results(decisions))
          expect(score).toBe(Math.max(0, 60 - 30 * scamsProcessed - 15 * legitHeld))
          expect([0, 15, 30, 45, 60]).toContain(score)
          cases++
        }
      }
    }
    expect(cases).toBe((6 + 15 + 20) * 64)
  })

  it('scores the worst day, with a raw sum of −75, as 0 (D2)', () => {
    const day = dayWithScamsAt([0, 1, 2])
    const worst = results(calls(day, [0, 1, 2, 3, 4, 5]))
    expect(sumPoints(day, worst)).toBe(-75)
    expect(scoreDay(day, worst)).toBe(0)
  })

  it('throws when the results do not match the day one for one', () => {
    const day = dayWithScamsAt([0])
    expect(() => scoreDay(day, results(['hold', 'process']))).toThrow()
    expect(() => scoreDay(day, results([...calls(day), 'hold']))).toThrow()
    expect(() => sumPoints(day, results([...calls(day), 'hold']))).toThrow()
  })
})
