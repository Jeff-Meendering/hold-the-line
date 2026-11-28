// The transaction slip (FR-3, design.md section 3.3). In full on the customer
// screen, like a printed slip, and in short on a debrief card. It is given a
// Slip and nothing else about the customer (SEC-18).
import { SLIP_TITLES } from '../data/labels.ts'
import type { Slip as SlipData } from '../game/types.ts'
import { TRANSACTION_EMOJI, cardsLine, formatMoney, slipSummary } from './format.ts'

type Line = { label: string; value: string }

function linesOf(slip: SlipData): Line[] {
  switch (slip.type) {
    case 'cash':
      return [{ label: 'Amount', value: formatMoney(slip.amount) }]
    case 'wire':
      return [
        { label: 'To', value: slip.recipient },
        { label: 'Destination', value: slip.destination },
        { label: 'Amount', value: formatMoney(slip.amount) },
      ]
    case 'giftCards':
      return [
        { label: 'Visa gift cards', value: cardsLine(slip.cardCount, slip.valuePerCard) },
        { label: 'Total', value: formatMoney(slip.amount) },
      ]
  }
}

export function Slip({ slip, form }: { slip: SlipData; form: 'full' | 'short' }) {
  if (form === 'short') {
    return (
      <>
        {slipSummary(slip)} Usual activity: {slip.accountNote}
      </>
    )
  }

  return (
    <section className="slip" aria-labelledby="slip-title">
      <h2 className="slip-title" id="slip-title">
        <span aria-hidden="true">{TRANSACTION_EMOJI[slip.type]} </span>
        {SLIP_TITLES[slip.type]}
      </h2>
      <dl className="slip-lines">
        {linesOf(slip).map((line) => (
          <div className="slip-line" key={line.label}>
            <dt>{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
      <dl className="slip-lines slip-note">
        <div className="slip-line">
          <dt>Usual activity</dt>
          <dd>{slip.accountNote}</dd>
        </div>
      </dl>
    </section>
  )
}
