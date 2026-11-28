// What the customer screen is given, and the small decisions it makes about
// its own controls (design.md section 3.3, D19). The reducer is still the
// backstop: it ignores a question it does not allow (G2).
import { MAX_QUESTIONS, QUESTION_IDS } from '../game/types.ts'
import type { Customer, CustomerView, QuestionId } from '../game/types.ts'

/** Copies the four fields the customer screen may see, and no others, so
 *  nothing else about the customer is even in its props (FR-7, T6, SEC-18). */
export function toCustomerView(customer: Customer): CustomerView {
  return { name: customer.name, slip: customer.slip, behaviour: customer.behaviour, answers: customer.answers }
}

/** The questions this customer offers, in bank order: the ones it has an
 *  answer to (design.md S1, AC-3.1). */
export function offeredQuestions(answers: CustomerView['answers']): QuestionId[] {
  return QUESTION_IDS.filter((id) => Object.hasOwn(answers, id) && typeof answers[id] === 'string')
}

export function questionsLeft(asked: readonly QuestionId[]): number {
  return Math.max(0, MAX_QUESTIONS - asked.length)
}

/** The three states of a question button (design.md section 3.3). */
export type QuestionState = 'available' | 'asked' | 'locked'

export function questionState(id: QuestionId, asked: readonly QuestionId[]): QuestionState {
  if (asked.includes(id)) return 'asked'
  return questionsLeft(asked) === 0 ? 'locked' : 'available'
}

/** How long Hold and Process ignore presses after a customer appears (D19). */
export const DECISION_GUARD_MS = 500

/** True once the guard has passed. Both times are in milliseconds from the
 *  same clock. */
export function acceptsDecision(shownAt: number, now: number): boolean {
  return now - shownAt >= DECISION_GUARD_MS
}
