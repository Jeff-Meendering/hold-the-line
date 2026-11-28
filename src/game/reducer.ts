// Every change to the game state (design.md sections 1.1 and 1.2). An action
// that is not allowed returns the same state object, unchanged (G2). The
// state records what the player did, never a score or a flag's status (G3).
import { canAsk } from './asking.ts'
import type { Action, Customer, Decision, GameState } from './types.ts'

type CustomerPhase = Extract<GameState, { phase: 'customer' }>

/** The state a day starts in, from the start screen and from the debrief
 *  alike, so Play again carries nothing over (G5, AC-7.1). */
function newDay(day: Customer[]): CustomerPhase {
  return { phase: 'customer', day, index: 0, asked: [], results: [] }
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
    case 'ask': {
      if (state.phase !== 'customer') return state
      const answers = state.day[state.index]?.answers
      if (answers === undefined || !canAsk(answers, state.asked, action.questionId)) return state
      return { ...state, asked: [...state.asked, action.questionId] }
    }
    case 'decide':
      if (state.phase !== 'customer') return state
      if (action.decision !== 'process' && action.decision !== 'hold') return state
      return decide(state, action.decision)
    default:
      return state
  }
}
