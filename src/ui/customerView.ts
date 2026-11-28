// What the customer screen is given, and the guard on its controls (design.md
// section 3.3, D19). Which questions it offers and whether one can be asked
// are rules in src/game/asking.ts, which the reducer uses too. The reducer is
// still the backstop: it ignores a question it does not allow (G2).
import { canAsk } from '../game/asking.ts'
import type { Customer, CustomerView, QuestionId } from '../game/types.ts'

/** Copies the four fields the customer screen may see, and no others, so
 *  nothing else about the customer is even in its props (FR-7, T6, SEC-18). */
export function toCustomerView(customer: Customer): CustomerView {
  return { name: customer.name, slip: customer.slip, behaviour: customer.behaviour, answers: customer.answers }
}

/** How long the question buttons, Hold, and Process ignore presses after a
 *  customer appears (D19). */
export const GUARD_MS = 500

/** True once the guard has passed: the time the customer appeared and the
 *  time of the press, in milliseconds from the same clock. */
export function pastGuard(shownAt: number, now: number): boolean {
  return now - shownAt >= GUARD_MS
}

/** A question press counts only if the reducer would allow the question and
 *  the guard has passed, so the second click of a double-click on Start, Play
 *  again, or a decision cannot ask a question on the customer that appears
 *  (D19). */
export function acceptsQuestion(
  id: QuestionId,
  answers: CustomerView['answers'],
  asked: readonly QuestionId[],
  shownAt: number,
  now: number,
): boolean {
  return canAsk(answers, asked, id) && pastGuard(shownAt, now)
}
