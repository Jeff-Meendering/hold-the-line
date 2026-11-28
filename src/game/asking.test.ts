import { describe, expect, it } from 'vitest'
import { canAsk, offeredQuestions, questionState, questionsLeft } from './asking.ts'
import { legit } from './testPool.ts'

// Which questions a customer offers and whether one can be asked (FR-4, FR-5).
// The reducer and the customer screen both use these.

describe('offeredQuestions (AC-3.1, design.md S1)', () => {
  it('lists the answered questions in bank order, whatever order the answers are in', () => {
    expect(offeredQuestions({ told: 'a', next: 'b', purpose: 'c', urgency: 'd', origin: 'e' })).toEqual([
      'purpose',
      'origin',
      'urgency',
      'next',
      'told',
    ])
    expect(offeredQuestions(legit('l1', 'wire').answers)).toEqual(['purpose', 'recipient', 'met', 'verified', 'told'])
    expect(offeredQuestions(legit('l1', 'giftCards').answers)).toEqual(['purpose', 'recipient', 'urgency', 'next', 'told'])
  })
})

describe('question states (FR-5, AC-3.2, AC-3.3)', () => {
  it('counts down from 3 to 0 and stays at 0', () => {
    expect(questionsLeft([])).toBe(3)
    expect(questionsLeft(['purpose'])).toBe(2)
    expect(questionsLeft(['purpose', 'origin'])).toBe(1)
    expect(questionsLeft(['purpose', 'origin', 'urgency'])).toBe(0)
    expect(questionsLeft(['purpose', 'origin', 'urgency', 'next'])).toBe(0)
  })

  it('marks asked questions asked, and the rest locked once 3 are asked', () => {
    expect(questionState('purpose', [])).toBe('available')
    expect(questionState('purpose', ['purpose'])).toBe('asked')
    expect(questionState('told', ['purpose', 'origin'])).toBe('available')
    expect(questionState('told', ['purpose', 'origin', 'urgency'])).toBe('locked')
    expect(questionState('origin', ['purpose', 'origin', 'urgency'])).toBe('asked')
  })
})

describe('canAsk (FR-4, FR-5, AC-3.2, AC-3.3)', () => {
  const cash = legit('l1', 'cash').answers

  it('allows an answered question that has not been asked while fewer than 3 are asked', () => {
    expect(canAsk(cash, [], 'purpose')).toBe(true)
    expect(canAsk(cash, ['purpose', 'origin'], 'told')).toBe(true)
  })

  it('refuses a question the customer has no answer to', () => {
    expect(canAsk(cash, [], 'met')).toBe(false)
    expect(canAsk({ purpose: undefined }, [], 'purpose')).toBe(false)
  })

  it('refuses a question already asked, and any question once 3 are asked', () => {
    expect(canAsk(cash, ['purpose'], 'purpose')).toBe(false)
    expect(canAsk(cash, ['purpose', 'origin', 'urgency'], 'told')).toBe(false)
  })

  it('allows exactly the questions offered and available', () => {
    for (const asked of [[], ['purpose'], ['purpose', 'origin'], ['purpose', 'origin', 'urgency']] as const) {
      for (const id of ['purpose', 'origin', 'urgency', 'next', 'told', 'recipient', 'met', 'verified'] as const) {
        const expected = offeredQuestions(cash).includes(id) && questionState(id, asked) === 'available'
        expect(canAsk(cash, asked, id), `${id} after ${asked.join(', ')}`).toBe(expected)
      }
    }
  })
})
