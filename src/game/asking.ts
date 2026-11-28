// Which questions a customer offers, and whether one can be asked (FR-4,
// FR-5, AC-3.1 to AC-3.3, design.md S1). The reducer and the customer screen
// both use these, so the buttons the screen offers and the questions the
// reducer accepts follow the same rules.
import { MAX_QUESTIONS, QUESTION_IDS } from './types.ts'
import type { CustomerView, QuestionId } from './types.ts'

type Answers = CustomerView['answers']

/** The customer has an answer to the question. */
function hasAnswer(answers: Answers, id: QuestionId): boolean {
  return Object.hasOwn(answers, id) && typeof answers[id] === 'string'
}

/** The questions this customer offers, in bank order: the ones it has an
 *  answer to (design.md S1, AC-3.1). */
export function offeredQuestions(answers: Answers): QuestionId[] {
  return QUESTION_IDS.filter((id) => hasAnswer(answers, id))
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

/** The customer has an answer to the question, it has not been asked, and
 *  fewer than 3 have been asked (FR-4, FR-5, AC-3.2, AC-3.3). */
export function canAsk(answers: Answers, asked: readonly QuestionId[], id: QuestionId): boolean {
  return hasAnswer(answers, id) && questionState(id, asked) === 'available'
}
