// The game state, the day draw, and the screen switch (architecture.md
// section 4, T1 to T3). The reducer is pure, so the day is drawn here, with
// the browser's random source, and passed in with the action.
import { useReducer } from 'react'
import { customers } from './data/customers.ts'
import { drawDay } from './game/draw.ts'
import { gameReducer } from './game/reducer.ts'
import type { GameState } from './game/types.ts'
import { CustomerScreen } from './ui/CustomerScreen.tsx'
import { DebriefScreen } from './ui/DebriefScreen.tsx'
import { StartScreen } from './ui/StartScreen.tsx'
import { toCustomerView } from './ui/customerView.ts'

const START: GameState = { phase: 'start' }

export function App() {
  const [state, dispatch] = useReducer(gameReducer, START)

  // Start and Play again both draw a fresh day (FR-10, G5).
  function startDay() {
    dispatch({ type: 'startDay', day: drawDay(customers, Math.random) })
  }

  switch (state.phase) {
    case 'start':
      return <StartScreen onStart={startDay} />
    case 'customer':
      return (
        // A new key for each customer mounts the screen afresh: focus moves
        // to the new name and the half-second guard starts again (U9, D19).
        <CustomerScreen
          key={state.index}
          view={toCustomerView(state.day[state.index])}
          number={state.index + 1}
          total={state.day.length}
          asked={state.asked}
          onAsk={(questionId) => dispatch({ type: 'ask', questionId })}
          onDecide={(decision) => dispatch({ type: 'decide', decision })}
        />
      )
    case 'debrief':
      return <DebriefScreen day={state.day} results={state.results} onPlayAgain={startDay} />
  }
}
