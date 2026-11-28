// The start screen (FR-1, FR-17, design.md sections 3.2 and 4.1). It says
// "some" customers are scams and never how many (AC-1.3).
import { useState } from 'react'
import { loadBestScore } from './bestScore.ts'
import { useHeadingFocus } from './useHeadingFocus.ts'

export function StartScreen({ onStart }: { onStart: () => void }) {
  const heading = useHeadingFocus()
  const [stored] = useState(loadBestScore)

  return (
    <main className="page start">
      <h1 className="start-title" ref={heading} tabIndex={-1}>
        <span aria-hidden="true">🏦 </span>
        Hold the Line
      </h1>
      <p className="premise">You're the bank teller. Some of today's customers are being scammed.</p>

      <section className="how-to-play" aria-labelledby="how-to-play-title">
        <h2 id="how-to-play-title">How to play</h2>
        <div className="how-group">
          <p>Six customers will come to your window, one at a time.</p>
          <p>Some are doing ordinary banking. Some have been tricked by a scammer, who has told them what to say to you.</p>
        </div>
        <div className="how-group">
          <p>For each customer:</p>
          <ol className="how-steps">
            <li>Read the slip and notice how they act.</li>
            <li>Ask up to 3 of the 5 questions.</li>
            <li>Process the transaction, or hold it.</li>
          </ol>
        </div>
        <div className="how-group">
          <p>A right call scores 10. Holding an honest customer costs 5. Letting a scam through costs 20.</p>
          <p>You find out how you did at the end of the day.</p>
        </div>
      </section>

      <button type="button" className="primary start-button" onClick={onStart}>
        Start the day
      </button>
      {stored.available && stored.best !== null && <p className="best">Best score: {stored.best} / 60</p>}
    </main>
  )
}
