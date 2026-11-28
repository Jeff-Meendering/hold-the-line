import { describe, expect, it } from 'vitest'
import { buildDebrief } from '../game/debrief.ts'
import { legit, scam, testSlip } from '../game/testPool.ts'
import type { Decision } from '../game/types.ts'
import {
  cardsLine,
  countsLine,
  formatMoney,
  formatPoints,
  outcomeSentence,
  placeText,
  pointsKey,
  slipSummary,
  sourceLinks,
  transactionLine,
  verdictText,
} from './format.ts'

// The text the screens build from more than one value (design.md sections
// 3.3 and 3.4). Customers come from the test helper, so only the shape of
// each line is checked here, not the real content.

describe('money and points', () => {
  it('prints whole dollars with thousands separators', () => {
    expect(formatMoney(500)).toBe('$500')
    expect(formatMoney(3000)).toBe('$3,000')
    expect(formatMoney(22500)).toBe('$22,500')
    expect(formatMoney(1000000)).toBe('$1,000,000')
  })

  it('prints points with a plus or a real minus sign', () => {
    expect(formatPoints(10)).toBe('+10')
    expect(formatPoints(-5)).toBe('−5')
    expect(formatPoints(-20)).toBe('−20')
    expect(formatPoints(0)).toBe('0')
  })
})

describe('the slip', () => {
  it('prints the gift-card line as count × value', () => {
    expect(cardsLine(6, 500)).toBe('6 × $500')
  })

  it('gives the debrief transaction line for each type, as in design.md 3.4', () => {
    expect(transactionLine({ type: 'cash', amount: 9000, accountNote: 'x' })).toBe('Cash withdrawal: $9,000')
    expect(
      transactionLine({ type: 'wire', amount: 18400, recipient: 'A Person', destination: 'Lisbon, Portugal', accountNote: 'x' }),
    ).toBe('Wire: $18,400 to A Person, Lisbon, Portugal')
    expect(transactionLine({ type: 'giftCards', amount: 3000, cardCount: 6, valuePerCard: 500, accountNote: 'x' })).toBe(
      'Gift cards: 6 × $500 = $3,000',
    )
  })

  it('gives the short slip for each type, the gift-card one as in the debrief wireframe', () => {
    expect(slipSummary({ type: 'giftCards', amount: 3000, cardCount: 6, valuePerCard: 500, accountNote: 'x' })).toBe(
      '6 Visa gift cards at $500.',
    )
    expect(slipSummary(testSlip('cash'))).toBe('Cash withdrawal of $900.')
    expect(slipSummary(testSlip('wire'))).toBe('Wire of $1,800 to Placeholder recipient, Placeholder city.')
  })
})

describe('the debrief lines', () => {
  const day = [scam('s1'), scam('s2'), legit('l1'), legit('l2'), legit('l3'), legit('l4')]

  function rowsFor(decisions: Decision[]) {
    return buildDebrief(
      day,
      decisions.map((decision) => ({ asked: [], decision })),
    )
  }

  it('gives the four sentences and verdicts in design.md 3.4', () => {
    const { rows } = rowsFor(['hold', 'process', 'process', 'hold', 'process', 'process'])
    expect(outcomeSentence(rows[0])).toBe('You held it. It was a scam: romance scam.')
    expect(verdictText(rows[0].correct)).toBe('RIGHT CALL')
    expect(outcomeSentence(rows[1])).toBe('You processed it. It was a scam: romance scam.')
    expect(verdictText(rows[1].correct)).toBe('WRONG CALL')
    expect(outcomeSentence(rows[2])).toBe('You processed it. It was legitimate.')
    expect(verdictText(rows[2].correct)).toBe('RIGHT CALL')
    expect(outcomeSentence(rows[3])).toBe('You held it. It was legitimate.')
    expect(verdictText(rows[3].correct)).toBe('WRONG CALL')
  })

  it('gives the counts line from the debrief wireframe', () => {
    const debrief = rowsFor(['hold', 'process', 'process', 'process', 'process', 'process'])
    expect(countsLine(debrief)).toBe('1 of 2 scams stopped. 4 of 4 legitimate customers served.')
  })

  it('says "scam" for a day with one scam', () => {
    expect(countsLine({ scams: 1, scamsHeld: 0, legit: 5, legitProcessed: 5 })).toBe(
      '0 of 1 scam stopped. 5 of 5 legitimate customers served.',
    )
  })

  it('adds the floor sentence to the points key only when the day was floored (D31)', () => {
    expect(pointsKey(false)).toBe('Right call +10. Legitimate customer held −5. Scam processed −20.')
    expect(pointsKey(true)).toBe(
      'Right call +10. Legitimate customer held −5. Scam processed −20. A day cannot score below 0.',
    )
  })

  it('says where a flag in plain view was, and nothing for one behind a question', () => {
    expect(placeText('slip')).toBe('on the slip')
    expect(placeText('behaviour')).toBe('at the window')
    expect(placeText('urgency')).toBeNull()
  })
})

describe('sourceLinks (D20, SEC-14)', () => {
  it('uses the hostname from each URL and its place in the list, and keeps the URL unchanged', () => {
    const urls = [
      'https://www.fincen.gov/a.pdf',
      'https://consumer.ftc.gov/articles/one',
      'https://consumer.ftc.gov/articles/two?x=1#y',
      'https://www.cftc.gov/b.html',
    ]
    expect(sourceLinks(urls)).toEqual([
      { href: urls[0], text: 'www.fincen.gov (1)' },
      { href: urls[1], text: 'consumer.ftc.gov (2)' },
      { href: urls[2], text: 'consumer.ftc.gov (3)' },
      { href: urls[3], text: 'www.cftc.gov (4)' },
    ])
  })

  it('never takes the link text from anything but the hostname', () => {
    const [link] = sourceLinks(['https://user:pass@consumer.ftc.gov:443/path'])
    expect(link.text).toBe('consumer.ftc.gov (1)')
  })
})
