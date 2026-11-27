// Everything the debrief shows, built from the day and the player's results
// (design.md section 1.4). Nothing here is stored: the score and the flag
// statuses exist only once the debrief asks for them (G3, architecture T6).
import { pointsFor, scoreDay, sumPoints } from './scoring.ts'
import { QUESTION_IDS } from './types.ts'
import type { Customer, CustomerResult, Decision, QuestionId, RedFlag, RedFlagId } from './types.ts'

export type FlagStatus = 'shown' | 'asked' | 'notAsked'

export interface DebriefFlag {
  id: RedFlagId
  shownIn: RedFlag['shownIn']
  /** shown: on the slip or in the behaviour. asked: behind a question the
   *  player asked. notAsked: behind a question the player did not ask. */
  status: FlagStatus
}

/** A legit look-alike's trait, with what the player saw of it. */
export interface DebriefLookAlike {
  flag: RedFlagId
  shownIn: RedFlag['shownIn']
  status: FlagStatus // as for a red flag
  explainedBy: QuestionId
  explanationAsked: boolean
}

export interface DebriefRow {
  customer: Customer
  decision: Decision
  correct: boolean
  points: number // +10, -5, or -20
  flags: DebriefFlag[] // slip, then behaviour, then answers in bank order. Empty for a legit customer
  lookAlike?: DebriefLookAlike // only for a legit customer that has one
}

export interface Debrief {
  score: number // 0 to 60, from scoreDay
  floored: boolean // true when the points added up to less than 0 and the score was raised to 0 (D2, D31)
  scams: number
  scamsHeld: number
  legit: number
  legitProcessed: number
  rows: DebriefRow[] // in the order played
}

function statusOf(shownIn: RedFlag['shownIn'], asked: readonly QuestionId[]): FlagStatus {
  if (shownIn === 'slip' || shownIn === 'behaviour') return 'shown'
  return asked.includes(shownIn) ? 'asked' : 'notAsked'
}

/** Where a flag sorts: the slip, then the behaviour, then the questions in
 *  bank order (design.md section 3.4). */
function placeRank(shownIn: RedFlag['shownIn']): number {
  if (shownIn === 'slip') return 0
  if (shownIn === 'behaviour') return 1
  return 2 + QUESTION_IDS.indexOf(shownIn)
}

function buildRow(customer: Customer, result: CustomerResult): DebriefRow {
  const { decision, asked } = result
  const points = pointsFor(customer.truth, decision)
  const correct = customer.truth === 'scam' ? decision === 'hold' : decision === 'process'
  const base = { customer, decision, correct, points }

  if (customer.truth === 'scam') {
    // Array sort is stable, so flags in the same place keep the data's order.
    const flags = [...customer.redFlags]
      .sort((a, b) => placeRank(a.shownIn) - placeRank(b.shownIn))
      .map((flag) => ({ id: flag.id, shownIn: flag.shownIn, status: statusOf(flag.shownIn, asked) }))
    return { ...base, flags }
  }

  const lookAlike = customer.lookAlike
  if (lookAlike === undefined) return { ...base, flags: [] }
  return {
    ...base,
    flags: [],
    lookAlike: {
      flag: lookAlike.flag,
      shownIn: lookAlike.shownIn,
      status: statusOf(lookAlike.shownIn, asked),
      explainedBy: lookAlike.explainedBy,
      explanationAsked: asked.includes(lookAlike.explainedBy),
    },
  }
}

/** results[i] belongs to day[i]. Throws if they are not the same length. */
export function buildDebrief(day: readonly Customer[], results: readonly CustomerResult[]): Debrief {
  const total = sumPoints(day, results)
  const rows = day.map((customer, i) => buildRow(customer, results[i]))
  const scamRows = rows.filter((r) => r.customer.truth === 'scam')
  const legitRows = rows.filter((r) => r.customer.truth === 'legit')
  return {
    score: scoreDay(day, results),
    floored: total < 0,
    scams: scamRows.length,
    scamsHeld: scamRows.filter((r) => r.decision === 'hold').length,
    legit: legitRows.length,
    legitProcessed: legitRows.filter((r) => r.decision === 'process').length,
    rows,
  }
}
