// The debrief (FR-8 to FR-10, FR-17, D20, design.md sections 3.4 and 4.3).
// Everything it shows comes from one buildDebrief call: the score and the
// flag statuses do not exist before this screen (G3, architecture T6).
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { RED_FLAG_LABELS } from '../data/labels.ts'
import { QUESTION_TEXT } from '../data/questions.ts'
import { buildDebrief } from '../game/debrief.ts'
import type { DebriefRow, FlagStatus } from '../game/debrief.ts'
import type { Customer, CustomerResult, RedFlag } from '../game/types.ts'
import { Slip } from './Slip.tsx'
import { bestScoreLine, loadBestScore, nextBest, saveBestScore } from './bestScore.ts'
import {
  STATUS_TEXT,
  TRANSACTION_EMOJI,
  countsLine,
  formatPoints,
  outcomeSentence,
  placeText,
  pointsKey,
  sourceLinks,
  transactionLine,
  verdictText,
} from './format.ts'
import { useHeadingFocus } from './useHeadingFocus.ts'

interface Props {
  day: readonly Customer[]
  results: readonly CustomerResult[]
  onPlayAgain: () => void
}

export function DebriefScreen({ day, results, onPlayAgain }: Props) {
  const heading = useHeadingFocus()
  const debrief = buildDebrief(day, results)
  const best = useBestScore(debrief.score)

  return (
    <div className="page">
      <header className="topbar">
        <p className="brand">Hold the Line</p>
        <h1 className="topbar-title" ref={heading} tabIndex={-1}>
          End of day
        </h1>
      </header>

      <main>
        <section className="score-block" aria-label="Your score">
          <p className="score">{debrief.score} / 60</p>
          {best !== null && <p className="score-best">{best}</p>}
          <p className="score-counts">{countsLine(debrief)}</p>
          <button type="button" className="primary score-again" onClick={onPlayAgain}>
            Play again
          </button>
          <p className="score-key">{pointsKey(debrief.floored)}</p>
        </section>

        <ol className="cards">
          {debrief.rows.map((row, i) => (
            <li key={i}>
              <Card row={row} number={i + 1} />
            </li>
          ))}
        </ol>

        <div className="play-again-end">
          <button type="button" className="primary" onClick={onPlayAgain}>
            Play again
          </button>
        </div>
      </main>
    </div>
  )
}

/** The best-score line, and the save (FR-17, D33). The stored best is read
 *  once, when the debrief appears, so the comparison is with the best from
 *  before this day. A new best is saved after the first render, and its line
 *  appears only once the save has worked. Saving the same number twice is
 *  harmless, so React's development double run of effects does no damage.
 *  Without storage, or if the save fails, there is no line. */
function useBestScore(score: number): string | null {
  const [stored] = useState(loadBestScore)
  const [saved, setSaved] = useState<boolean | null>(null)
  const result = stored.available ? nextBest(stored.best, score) : null
  const save = result?.isNew ? result.best : null

  useEffect(() => {
    if (save !== null) setSaved(saveBestScore(save))
  }, [save])

  return bestScoreLine(result, saved)
}

function Card({ row, number }: { row: DebriefRow; number: number }) {
  const { customer } = row
  return (
    <article className="card" aria-labelledby={`card-${number}`}>
      <div className="card-head">
        <h2 className="card-name" id={`card-${number}`}>
          <span className="card-number">{number}</span> {customer.name}
        </h2>
        <p className="card-transaction">
          <span aria-hidden="true">{TRANSACTION_EMOJI[customer.slip.type]} </span>
          {transactionLine(customer.slip)}
        </p>
        <p className={row.correct ? 'verdict verdict-right' : 'verdict verdict-wrong'}>
          <span>
            <span aria-hidden="true">{row.correct ? '✓ ' : '✗ '}</span>
            {verdictText(row.correct)}
          </span>{' '}
          <span>{formatPoints(row.points)}</span>
        </p>
      </div>
      <p className="card-outcome">{outcomeSentence(row)}</p>

      {customer.truth === 'scam' ? (
        <>
          <CardPart title="What happened">
            <p>{customer.explanation}</p>
          </CardPart>
          <CardPart title="What was in front of you">
            <dl className="evidence">
              <div>
                <dt>Slip</dt>
                <dd>
                  <Slip slip={customer.slip} form="short" />
                </dd>
              </div>
              <div>
                <dt>Window</dt>
                <dd>{customer.behaviour}</dd>
              </div>
            </dl>
          </CardPart>
          <CardPart title="Red flags" emoji="🚩">
            <ul className="flags">
              {row.flags.map((flag) => (
                <FlagItem
                  key={flag.id}
                  status={flag.status}
                  label={RED_FLAG_LABELS[flag.id]}
                  shownIn={flag.shownIn}
                  answers={customer.answers}
                />
              ))}
            </ul>
          </CardPart>
          <CardPart title="Read more" className="read-more">
            <ul className="sources">
              {sourceLinks(customer.sourceUrls).map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </CardPart>
        </>
      ) : (
        <>
          <CardPart title="Why it was fine">
            <p>{customer.explanation}</p>
          </CardPart>
          {row.lookAlike && (
            <>
              <CardPart title="What could look like a red flag">
                <ul className="flags">
                  <FlagItem
                    status={row.lookAlike.status}
                    label={RED_FLAG_LABELS[row.lookAlike.flag]}
                    shownIn={row.lookAlike.shownIn}
                    answers={customer.answers}
                  />
                </ul>
              </CardPart>
              <CardPart title="What explains it">
                <ul className="flags">
                  <FlagItem
                    status={row.lookAlike.explanationAsked ? 'asked' : 'notAsked'}
                    shownIn={row.lookAlike.explainedBy}
                    answers={customer.answers}
                  />
                </ul>
              </CardPart>
            </>
          )}
        </>
      )}
    </article>
  )
}

function CardPart({
  title,
  emoji,
  className,
  children,
}: {
  title: string
  emoji?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={className ? `card-part ${className}` : 'card-part'}>
      <h3>
        {emoji && <span aria-hidden="true">{emoji} </span>}
        {title}
      </h3>
      {children}
    </section>
  )
}

/** One red flag, or a look-alike's trait or its explaining answer: the
 *  status, then the label, then where it was or the question and the
 *  answer (design.md section 3.4, U7). The explaining answer has no label. */
function FlagItem({
  status,
  label,
  shownIn,
  answers,
}: {
  status: FlagStatus
  label?: string
  shownIn: RedFlag['shownIn']
  answers: Customer['answers']
}) {
  const place = placeText(shownIn)
  const question = shownIn === 'slip' || shownIn === 'behaviour' ? null : shownIn
  return (
    <li className="flag">
      <p className={status === 'notAsked' ? 'chip chip-missed' : 'chip'}>{STATUS_TEXT[status]}</p>
      <div className="flag-text">
        {label !== undefined && (
          <p>
            {label}
            {place !== null && <span className="flag-place"> ({place})</span>}
          </p>
        )}
        {question !== null && (
          <dl className="qa">
            <div>
              <dt>Question</dt>
              <dd>{QUESTION_TEXT[question]}</dd>
            </div>
            <div>
              <dt>Answer</dt>
              <dd>“{answers[question]}”</dd>
            </div>
          </dl>
        )}
      </div>
    </li>
  )
}
