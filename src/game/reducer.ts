// Every change to the game state (design.md sections 1.1 and 1.2). An action
// that is not allowed returns the same state object, unchanged (G2). The
// state records what the player did, never a score or a flag's status (G3).
import { MAX_QUESTIONS } from './types.ts'
import type { Action, Customer, Decision, GameState, QuestionId } from './types.ts'

type CustomerPhase = Extract<GameState, { phase: 'customer' }>

/** The state a day starts in, from the start screen and from the debrief
 *  alike, so Play again carries nothing over (G5, AC-7.1). */
function newDay(day: Customer[]): CustomerPhase {
  return { phase: 'customer', day, index: 0, asked: [], results: [] }
}

/** The current customer has an answer to the question, it has not been
 *  asked, and fewer than 3 have been asked (FR-4, FR-5, AC-3.2, AC-3.3). */
function canAsk(state: CustomerPhase, questionId: QuestionId): boolean {
  const answers = state.day[state.index]?.answers
  return (
    answers !== undefined &&
    Object.hasOwn(answers, questionId) &&
    typeof answers[questionId] === 'string' &&
    !state.asked.includes(questionId) &&
    state.asked.length < MAX_QUESTIONS
  )
}

function decide(state: CustomerPhase, decision: Decision): GameState {
  const results = [...state.results, { asked: state.asked, decision }]
  if (state.index + 1 < state.day.length) {
    return { ...state, index: state.index + 1, asked: [], results }
  }
  return { phase: 'debrief', day: state.day, results }
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'startDay':
      return state.phase === 'customer' ? state : newDay(action.day)
    case 'ask':
      if (state.phase !== 'customer' || !canAsk(state, action.questionId)) return state
      return { ...state, asked: [...state.asked, action.questionId] }
    case 'decide':
      if (state.phase !== 'customer') return state
      if (action.decision !== 'process' && action.decision !== 'hold') return state
      return decide(state, action.decision)
    default:
      return state
  }
}
