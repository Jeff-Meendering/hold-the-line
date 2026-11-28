import { describe, expect, it } from 'vitest'
import { legit, scam } from '../game/testPool.ts'
import { GUARD_MS, acceptsQuestion, pastGuard, toCustomerView } from './customerView.ts'

// The customer screen's props and its controls (FR-4 to FR-7, D19).

describe('toCustomerView (FR-7, SEC-18)', () => {
  it('keeps the name, slip, behaviour, and answers, and nothing else', () => {
    const customer = scam('s1', 'giftCards', { sourceUrls: ['placeholder'] })
    const view = toCustomerView(customer)
    expect(Object.keys(view).sort()).toEqual(['answers', 'behaviour', 'name', 'slip'])
    expect(view).toEqual({
      name: customer.name,
      slip: customer.slip,
      behaviour: customer.behaviour,
      answers: customer.answers,
    })
  })

  it('carries none of the hidden fields, for a scam or a legit look-alike', () => {
    const customers = [
      scam('s1', 'wire'),
      legit('l1', 'cash', { lookAlike: { flag: 'RF-8', shownIn: 'slip', explainedBy: 'purpose' } }),
    ]
    for (const customer of customers) {
      const view = toCustomerView(customer)
      expect(view).not.toHaveProperty('id')
      const text = JSON.stringify(view)
      for (const word of ['truth', 'scam', 'legit', 'redFlags', 'RF-', 'lookAlike', 'explanation', 'sourceUrls']) {
        expect(text, word).not.toContain(word)
      }
    }
  })
})

describe('the half-second guard (D19, AC-4.4)', () => {
  const cash = legit('l1', 'cash').answers

  it('ignores a press in the first half second and accepts one after it', () => {
    expect(GUARD_MS).toBe(500)
    expect(pastGuard(1000, 1000)).toBe(false)
    expect(pastGuard(1000, 1150)).toBe(false)
    expect(pastGuard(1000, 1499.9)).toBe(false)
    expect(pastGuard(1000, 1500)).toBe(true)
    expect(pastGuard(1000, 4000)).toBe(true)
  })

  it('ignores a question pressed in the first half second, as the second click of a double-click on Start would be', () => {
    expect(acceptsQuestion('purpose', cash, [], 1000, 1080)).toBe(false)
    expect(acceptsQuestion('purpose', cash, [], 1000, 1499.9)).toBe(false)
    expect(acceptsQuestion('purpose', cash, [], 1000, 1500)).toBe(true)
  })

  it('still ignores an asked or locked question after the half second', () => {
    expect(acceptsQuestion('purpose', cash, ['purpose'], 1000, 5000)).toBe(false)
    expect(acceptsQuestion('told', cash, ['purpose', 'origin', 'urgency'], 1000, 5000)).toBe(false)
  })

  it('ignores a question the customer has no answer to, as the reducer does', () => {
    expect(acceptsQuestion('met', cash, [], 1000, 5000)).toBe(false)
  })
})
