import { describe, expect, it } from 'vitest'
import { buildDebrief } from './debrief.ts'
import { scoreDay } from './scoring.ts'
import { legit, scam } from './testPool.ts'
import type { Customer, CustomerResult, Decision, QuestionId } from './types.ts'

const result = (decision: Decision, asked: QuestionId[] = []): CustomerResult => ({ asked, decision })

/** The structure of the example customer in design.md section 2.5, with
 *  placeholder text: a gift-card scam with flags on the slip, in the
 *  behaviour, and behind `urgency` and `next`. */
const walterLike = scam('walter-like', 'giftCards', {
  scamType: 'techSupport',
  redFlags: [
    { id: 'RF-11', shownIn: 'slip' },
    { id: 'RF-1', shownIn: 'behaviour' },
    { id: 'RF-4', shownIn: 'urgency' },
    { id: 'RF-12', shownIn: 'next' },
  ],
})

/** The look-alike fragment in design.md section 2.5, on a legit wire customer. */
const lookAlikeWire = legit('look-alike-wire', 'wire', {
  lookAlike: { flag: 'RF-13', shownIn: 'met', explainedBy: 'verified' },
})

describe('buildDebrief (design.md section 1.4, FR-8, FR-9)', () => {
  describe('rows and score (AC-6.1, AC-6.2)', () => {
    const day: Customer[] = [scam('s1'), legit('l1'), scam('s2'), legit('l2'), legit('l3'), legit('l4')]
    const results = [result('hold'), result('process'), result('process'), result('hold'), result('process'), result('process')]
    const debrief = buildDebrief(day, results)

    it('lists the customers in the order played, with the call, right or wrong, and the points for all four cases', () => {
      expect(debrief.rows.map((r) => [r.customer.id, r.decision, r.correct, r.points])).toEqual([
        ['s1', 'hold', true, 10],
        ['l1', 'process', true, 10],
        ['s2', 'process', false, -20],
        ['l2', 'hold', false, -5],
        ['l3', 'process', true, 10],
        ['l4', 'process', true, 10],
      ])
      expect(debrief.rows.map((r) => r.customer)).toEqual(day)
    })

    it('has the score from scoreDay and the four counts', () => {
      expect(debrief.score).toBe(scoreDay(day, results))
      expect(debrief.score).toBe(15)
      expect(debrief).toMatchObject({ scams: 2, scamsHeld: 1, legit: 4, legitProcessed: 3 })
    })

    it('gives 30, "1 of 2" and "4 of 4" for the day in the debrief wireframe (design.md section 4.3)', () => {
      const wireframeDay: Customer[] = [walterLike, lookAlikeWire, legit('l2'), scam('s2', 'wire'), legit('l3'), legit('l4')]
      const wireframe = buildDebrief(wireframeDay, [
        result('process', ['purpose', 'urgency', 'told']),
        result('process', ['met']),
        result('process'),
        result('hold'),
        result('process'),
        result('process'),
      ])
      expect(wireframe).toMatchObject({ score: 30, floored: false, scams: 2, scamsHeld: 1, legit: 4, legitProcessed: 4 })
    })

    it('throws when the results do not match the day one for one', () => {
      expect(() => buildDebrief(day, results.slice(0, 5))).toThrow()
    })
  })

  describe('red flag status (AC-6.3, D12)', () => {
    it('gives the four statuses in design.md section 2.5 for the example asked purpose, urgency, and told', () => {
      const [row] = buildDebrief([walterLike], [result('process', ['purpose', 'urgency', 'told'])]).rows
      expect(row.flags).toEqual([
        { id: 'RF-11', shownIn: 'slip', status: 'shown' },
        { id: 'RF-1', shownIn: 'behaviour', status: 'shown' },
        { id: 'RF-4', shownIn: 'urgency', status: 'asked' },
        { id: 'RF-12', shownIn: 'next', status: 'notAsked' },
      ])
    })

    it('marks a slip or behaviour flag shown whatever was asked', () => {
      for (const asked of [[], ['urgency', 'next'], ['purpose', 'recipient', 'told']] as QuestionId[][]) {
        const [row] = buildDebrief([walterLike], [result('hold', asked)]).rows
        expect(row.flags.filter((f) => f.shownIn === 'slip' || f.shownIn === 'behaviour').map((f) => f.status)).toEqual([
          'shown',
          'shown',
        ])
      }
    })

    it('marks a flag behind a question asked or notAsked to match the questions asked', () => {
      const statuses = (asked: QuestionId[]) =>
        buildDebrief([walterLike], [result('hold', asked)]).rows[0].flags.slice(2).map((f) => f.status)
      expect(statuses([])).toEqual(['notAsked', 'notAsked'])
      expect(statuses(['urgency'])).toEqual(['asked', 'notAsked'])
      expect(statuses(['next'])).toEqual(['notAsked', 'asked'])
      expect(statuses(['next', 'urgency'])).toEqual(['asked', 'asked'])
    })

    it('lists flags as slip, then behaviour, then answers in bank order, whatever order the data has', () => {
      const scrambled = scam('scrambled', 'giftCards', {
        redFlags: [
          { id: 'RF-6', shownIn: 'told' },
          { id: 'RF-12', shownIn: 'next' },
          { id: 'RF-2', shownIn: 'behaviour' },
          { id: 'RF-5', shownIn: 'purpose' },
          { id: 'RF-11', shownIn: 'slip' },
          { id: 'RF-1', shownIn: 'behaviour' },
        ],
      })
      const [row] = buildDebrief([scrambled], [result('hold')]).rows
      expect(row.flags.map((f) => [f.shownIn, f.id])).toEqual([
        ['slip', 'RF-11'],
        ['behaviour', 'RF-2'],
        ['behaviour', 'RF-1'],
        ['purpose', 'RF-5'],
        ['next', 'RF-12'],
        ['told', 'RF-6'],
      ])
      // The customer's own data is not reordered.
      expect(scrambled.redFlags[0].id).toBe('RF-6')
    })

    it('gives a legit customer no flags', () => {
      const debrief = buildDebrief([legit('l1'), lookAlikeWire], [result('process'), result('hold', ['met'])])
      expect(debrief.rows.map((r) => r.flags)).toEqual([[], []])
    })
  })

  describe('floored (D2, D31)', () => {
    const threeScams: Customer[] = [scam('s1'), scam('s2'), scam('s3'), legit('l1'), legit('l2'), legit('l3')]
    const twoScams: Customer[] = [scam('s1'), scam('s2'), legit('l1'), legit('l2'), legit('l3'), legit('l4')]
    const oneScam: Customer[] = [scam('s1'), legit('l1'), legit('l2'), legit('l3'), legit('l4'), legit('l5')]
    const all = (decision: Decision) => Array.from({ length: 6 }, () => result(decision))

    it('is true when the points add up to less than 0', () => {
      expect(buildDebrief(oneScam, all('hold'))).toMatchObject({ score: 0, floored: true }) // 10 - 25 = -15
      expect(buildDebrief(threeScams, all('process'))).toMatchObject({ score: 0, floored: true }) // -60 + 30 = -30
    })

    it('is false when they add up to exactly 0', () => {
      expect(buildDebrief(twoScams, all('hold'))).toMatchObject({ score: 0, floored: false }) // 20 - 20
      expect(buildDebrief(twoScams, all('process'))).toMatchObject({ score: 0, floored: false }) // -40 + 40
    })

    it('is false when they add up to more than 0', () => {
      expect(buildDebrief(threeScams, all('hold'))).toMatchObject({ score: 15, floored: false })
      expect(buildDebrief(oneScam, all('process'))).toMatchObject({ score: 30, floored: false })
    })
  })

  describe('look-alikes (AC-6.5, D20, D21)', () => {
    const lookAlikeOf = (customer: Customer, asked: QuestionId[]) =>
      buildDebrief([customer], [result('process', asked)]).rows[0].lookAlike

    it('marks the trait and the explanation asked when both were asked', () => {
      expect(lookAlikeOf(lookAlikeWire, ['met', 'verified'])).toEqual({
        flag: 'RF-13',
        shownIn: 'met',
        status: 'asked',
        explainedBy: 'verified',
        explanationAsked: true,
      })
    })

    it('marks the trait asked and the explanation not asked, as on the wireframe card', () => {
      expect(lookAlikeOf(lookAlikeWire, ['met'])).toMatchObject({ status: 'asked', explanationAsked: false })
    })

    it('marks the explanation asked and the trait not asked', () => {
      expect(lookAlikeOf(lookAlikeWire, ['verified', 'told'])).toMatchObject({ status: 'notAsked', explanationAsked: true })
    })

    it('marks neither when neither was asked', () => {
      expect(lookAlikeOf(lookAlikeWire, ['purpose'])).toMatchObject({ status: 'notAsked', explanationAsked: false })
    })

    it('marks a trait on the slip or in the behaviour shown', () => {
      const onSlip = legit('on-slip', 'cash', { lookAlike: { flag: 'RF-8', shownIn: 'slip', explainedBy: 'purpose' } })
      const atCounter = legit('at-counter', 'cash', { lookAlike: { flag: 'RF-1', shownIn: 'behaviour', explainedBy: 'origin' } })
      expect(lookAlikeOf(onSlip, [])).toMatchObject({ status: 'shown', explanationAsked: false })
      expect(lookAlikeOf(atCounter, ['origin'])).toMatchObject({ status: 'shown', explanationAsked: true })
    })

    it('gives no lookAlike to a legit customer without one, or to a scam customer', () => {
      const rows = buildDebrief([legit('plain'), walterLike], [result('process'), result('hold')]).rows
      expect(rows[0]).not.toHaveProperty('lookAlike')
      expect(rows[1]).not.toHaveProperty('lookAlike')
    })
  })
})
