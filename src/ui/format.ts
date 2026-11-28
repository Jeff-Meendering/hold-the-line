// Text the screens print that is built from more than one value: money,
// points, the slip in short, the debrief's lines, and the source links
// (design.md sections 3.3 and 3.4). Pure functions, so format.test.ts can
// check them without rendering anything.
import { SCAM_TYPE_LABELS, TRANSACTION_LABELS } from '../data/labels.ts'
import type { DebriefRow, FlagStatus } from '../game/debrief.ts'
import type { RedFlag, Slip, TransactionType } from '../game/types.ts'

const MINUS = '−'
const TIMES = '×'

/** Decoration before the slip title and the debrief's transaction line
 *  (design.md section 3.6). Always rendered with aria-hidden. */
export const TRANSACTION_EMOJI: Record<TransactionType, string> = {
  cash: '💵',
  wire: '💸',
  giftCards: '💳',
}

/** Whole US dollars, as in "$18,400". */
export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

/** "+10", "−5", or "−20", with a real minus sign. */
export function formatPoints(points: number): string {
  if (points > 0) return `+${points}`
  if (points < 0) return `${MINUS}${-points}`
  return '0'
}

/** "6 × $500", the gift-card line on the slip. */
export function cardsLine(cardCount: number, valuePerCard: number): string {
  return `${cardCount} ${TIMES} ${formatMoney(valuePerCard)}`
}

/** The one-line transaction on every debrief card (design.md section 3.4). */
export function transactionLine(slip: Slip): string {
  const label = TRANSACTION_LABELS[slip.type]
  switch (slip.type) {
    case 'cash':
      return `${label}: ${formatMoney(slip.amount)}`
    case 'wire':
      return `${label}: ${formatMoney(slip.amount)} to ${slip.recipient}, ${slip.destination}`
    case 'giftCards':
      return `${label}: ${cardsLine(slip.cardCount, slip.valuePerCard)} = ${formatMoney(slip.amount)}`
  }
}

/** The slip in one sentence, for "What was in front of you" on a scam card.
 *  The account note follows it. */
export function slipSummary(slip: Slip): string {
  switch (slip.type) {
    case 'cash':
      return `Cash withdrawal of ${formatMoney(slip.amount)}.`
    case 'wire':
      return `Wire of ${formatMoney(slip.amount)} to ${slip.recipient}, ${slip.destination}.`
    case 'giftCards':
      return `${slip.cardCount} Visa gift cards at ${formatMoney(slip.valuePerCard)}.`
  }
}

/** What happened on a card: one of the four sentences in design.md
 *  section 3.4. */
export function outcomeSentence(row: DebriefRow): string {
  const did = row.decision === 'hold' ? 'You held it.' : 'You processed it.'
  const customer = row.customer
  const was =
    customer.truth === 'scam' ? `It was a scam: ${SCAM_TYPE_LABELS[customer.scamType]}.` : 'It was legitimate.'
  return `${did} ${was}`
}

export function verdictText(correct: boolean): string {
  return correct ? 'RIGHT CALL' : 'WRONG CALL'
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

/** "1 of 2 scams stopped. 4 of 4 legitimate customers served." */
export function countsLine(counts: { scams: number; scamsHeld: number; legit: number; legitProcessed: number }): string {
  const scams = plural(counts.scams, 'scam', 'scams')
  const legit = plural(counts.legit, 'legitimate customer', 'legitimate customers')
  return `${counts.scamsHeld} of ${counts.scams} ${scams} stopped. ${counts.legitProcessed} of ${counts.legit} ${legit} served.`
}

/** The points key under the score. With `floored`, it says why a day with
 *  points below 0 shows 0 (D2, D31). */
export function pointsKey(floored: boolean): string {
  const key = `Right call +10. Legitimate customer held ${MINUS}5. Scam processed ${MINUS}20.`
  return floored ? `${key} A day cannot score below 0.` : key
}

export const STATUS_TEXT: Record<FlagStatus, string> = {
  shown: 'shown',
  asked: 'you asked',
  notAsked: "you didn't ask",
}

/** "on the slip" or "at the window" for a flag that was in plain view, and
 *  null for one behind a question. */
export function placeText(shownIn: RedFlag['shownIn']): string | null {
  if (shownIn === 'slip') return 'on the slip'
  if (shownIn === 'behaviour') return 'at the window'
  return null
}

/** Each source link's text: the hostname from the URL itself and its
 *  position in the customer's list, as in "consumer.ftc.gov (3)" (D20,
 *  SEC-14). The href is the URL unchanged. */
export function sourceLinks(urls: readonly string[]): { href: string; text: string }[] {
  return urls.map((href, i) => ({ href, text: `${new URL(href).hostname} (${i + 1})` }))
}
