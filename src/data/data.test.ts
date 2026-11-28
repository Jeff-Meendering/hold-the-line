import { describe, expect, it } from 'vitest'
import { drawDay } from '../game/draw.ts'
import { mulberry32 } from '../game/rng.ts'
import { RED_FLAG_IDS, SCAM_TYPES, TRANSACTION_TYPES } from '../game/types.ts'
import { validateData } from '../game/validate.ts'
import { customers } from './customers.ts'
import { RED_FLAG_LABELS, SCAM_TYPE_LABELS, SLIP_TITLES, TRANSACTION_LABELS } from './labels.ts'
import { QUESTION_SETS, QUESTION_TEXT } from './questions.ts'

// The data validation test (test-plan.md section 3, FR-15). It is the one
// test that reads the real content. The rules themselves are tested on
// made-up pools in src/game/validate.test.ts.

describe('the real content', () => {
  it('passes every rule V1 to V17 (FR-11 to FR-15, FR-18, FR-19)', () => {
    const messages = validateData({ questionText: QUESTION_TEXT, questionSets: QUESTION_SETS, customers })
    // On failure this prints every message, each starting with the customer
    // or question id it is about.
    expect(messages, messages.join('\n')).toEqual([])
  })

  it('has a label for every red flag id, scam type, and transaction type, and a slip title for each type (FR-9, FR-3)', () => {
    // The types already require this, but npm test does not check types.
    const labelSets: [string, readonly string[], Record<string, unknown>][] = [
      ['RED_FLAG_LABELS', RED_FLAG_IDS, RED_FLAG_LABELS],
      ['SCAM_TYPE_LABELS', SCAM_TYPES, SCAM_TYPE_LABELS],
      ['TRANSACTION_LABELS', TRANSACTION_TYPES, TRANSACTION_LABELS],
      ['SLIP_TITLES', TRANSACTION_TYPES, SLIP_TITLES],
    ]
    const problems: string[] = []
    for (const [name, ids, labels] of labelSets) {
      for (const id of ids) {
        const label = labels[id]
        if (typeof label !== 'string' || label.trim() === '') problems.push(`${id}: ${name} has no label`)
      }
      for (const key of Object.keys(labels)) {
        if (!ids.includes(key)) problems.push(`${key}: ${name} has a label for an id that does not exist`)
      }
    }
    expect(problems).toEqual([])
  })

  it('draws days of 6 different customers with 1 to 3 scams, over seeds 1 to 1,000 (AC-5.1)', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const day = drawDay(customers, mulberry32(seed))
      const scams = day.filter((c) => c.truth === 'scam').length
      expect(day, `seed ${seed}`).toHaveLength(6)
      expect(new Set(day.map((c) => c.id)).size, `seed ${seed}`).toBe(6)
      expect(scams, `seed ${seed}`).toBeGreaterThanOrEqual(1)
      expect(scams, `seed ${seed}`).toBeLessThanOrEqual(3)
    }
  })
})
