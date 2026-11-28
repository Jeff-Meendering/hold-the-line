// The customer screen (FR-2 to FR-7, design.md sections 3.3 and 4.2). It is
// given a CustomerView and nothing else about the customer, so it cannot show
// anything about how the day is going (FR-7, SEC-18). Nothing here changes
// when a decision is made except the customer (AC-4.2).
//
// App gives each customer its own key, so this screen mounts afresh for
// every customer: focus goes to the name, and the decision guard restarts.
import { useState } from 'react'
import { QUESTION_TEXT } from '../data/questions.ts'
import type { CustomerView, Decision, QuestionId } from '../game/types.ts'
import { Slip } from './Slip.tsx'
import { acceptsDecision, offeredQuestions, questionState, questionsLeft } from './customerView.ts'
import { useHeadingFocus } from './useHeadingFocus.ts'

interface Props {
  view: CustomerView
  /** Position in the day, from 1. */
  number: number
  total: number
  asked: readonly QuestionId[]
  onAsk: (questionId: QuestionId) => void
  onDecide: (decision: Decision) => void
}

export function CustomerScreen({ view, number, total, asked, onAsk, onDecide }: Props) {
  const heading = useHeadingFocus()
  // The one timer in the app (D19): Hold and Process ignore presses for the
  // first half second after this customer appears, so a double-click on the
  // last customer's button cannot decide this one too. It is read from the
  // first render, before any later click can arrive.
  const [shownAt] = useState(() => performance.now())

  function decide(decision: Decision) {
    if (acceptsDecision(shownAt, performance.now())) onDecide(decision)
  }

  return (
    <div className="page">
      <header className="topbar">
        <p className="brand">Hold the Line</p>
        <p>
          Customer {number} of {total}
        </p>
      </header>

      <main className="counter">
        <section className="who">
          <h1 className="customer-name" ref={heading} tabIndex={-1}>
            {view.name}
          </h1>
          <p className="behaviour">{view.behaviour}</p>
          <Slip slip={view.slip} form="full" />
        </section>

        <section className="questions" aria-labelledby="questions-title">
          <div className="questions-head">
            <h2 id="questions-title">Ask up to 3 questions</h2>
            <p>Questions left: {questionsLeft(asked)}</p>
          </div>
          <ul className="question-list">
            {offeredQuestions(view.answers).map((id) => {
              const state = questionState(id, asked)
              return (
                <li key={id}>
                  <button
                    type="button"
                    className="question"
                    aria-disabled={state === 'available' ? undefined : true}
                    onClick={() => {
                      if (state === 'available') onAsk(id)
                    }}
                  >
                    <span>{QUESTION_TEXT[id]}</span>
                    {state === 'asked' && <span className="asked-mark">asked</span>}
                  </button>
                  <div aria-live="polite">
                    {state === 'asked' && <p className="answer">“{view.answers[id]}”</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="decisions">
          <button type="button" className="decision hold" onClick={() => decide('hold')}>
            Hold the transaction
          </button>
          <button type="button" className="decision process" onClick={() => decide('process')}>
            Process the transaction
          </button>
        </div>
      </main>
    </div>
  )
}
