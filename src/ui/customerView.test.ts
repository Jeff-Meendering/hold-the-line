import { describe, expect, it } from 'vitest'
import { legit, scam } from '../game/testPool.ts'
import {
  DECISION_GUARD_MS,
  acceptsDecision,
  offeredQuestions,
  questionState,
  questionsLeft,
  toCustomerView,
} from './customerView.ts'

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

describe('the decision guard (D19, AC-4.4)', () => {
  it('ignores a press in the first half second and accepts one after it', () => {
    expect(DECISION_GUARD_MS).toBe(500)
    expect(acceptsDecision(1000, 1000)).toBe(false)
    expect(acceptsDecision(1000, 1150)).toBe(false)
    expect(acceptsDecision(1000, 1499.9)).toBe(false)
    expect(acceptsDecision(1000, 1500)).toBe(true)
    expect(acceptsDecision(1000, 4000)).toBe(true)
  })
})
