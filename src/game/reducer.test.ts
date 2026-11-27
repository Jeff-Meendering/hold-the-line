import { describe, expect, it } from 'vitest'
import { gameReducer } from './reducer.ts'
import { mulberry32 } from './rng.ts'
import { legit, scam } from './testPool.ts'
import type { Action, Customer, GameState, QuestionId } from './types.ts'

/** Freezes a value and everything inside it, so a reducer that mutates
 *  its input throws instead of passing. */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const inner of Object.values(value)) deepFreeze(inner)
  }
  return value
}

/** Every reducer call in this file goes through here. */
const reduce = (state: GameState, action: Action): GameState => gameReducer(deepFreeze(state), deepFreeze(action))

// A cash customer answers purpose, origin, urgency, next, and told.
// A wire customer answers purpose, recipient, met, verified, and told.
const DAY: Customer[] = [
  scam('s1', 'cash'),
  legit('l1', 'wire'),
  legit('l2', 'giftCards'),
  scam('s2', 'wire'),
  legit('l3', 'cash'),
  legit('l4', 'giftCards'),
]

const START: GameState = { phase: 'start' }
const FIRST: GameState = { phase: 'customer', day: DAY, index: 0, asked: [], results: [] }

const play = (state: GameState, ...actions: Action[]) => actions.reduce(reduce, state)
const ask = (questionId: QuestionId): Action => ({ type: 'ask', questionId })
const PROCESS: Action = { type: 'decide', decision: 'process' }
const HOLD: Action = { type: 'decide', decision: 'hold' }

function customerPhase(state: GameState) {
  if (state.phase !== 'customer') throw new Error(`expected the customer phase, got ${state.phase}`)
  return state
}

describe('gameReducer (design.md section 1.2)', () => {
  describe('startDay', () => {
    it('from start gives the customer phase with the new day, index 0, and nothing asked or decided (FR-2)', () => {
      expect(reduce(START, { type: 'startDay', day: DAY })).toEqual(FIRST)
    })

    it('from the debrief gives exactly the state a first start gives (FR-10, AC-7.1, G5)', () => {
      const debrief = play(FIRST, ask('purpose'), HOLD, PROCESS, PROCESS, HOLD, PROCESS, PROCESS)
      expect(debrief.phase).toBe('debrief')
      const newDay = [...DAY].reverse()
      expect(reduce(debrief, { type: 'startDay', day: newDay })).toEqual(
        reduce(START, { type: 'startDay', day: newDay }),
      )
    })

    it('does nothing in the middle of a day', () => {
      const midDay = play(FIRST, ask('origin'), HOLD)
      expect(reduce(midDay, { type: 'startDay', day: [...DAY].reverse() })).toBe(midDay)
    })
  })

  describe('ask (FR-4, FR-5)', () => {
    it('records a valid question', () => {
      expect(customerPhase(reduce(FIRST, ask('urgency'))).asked).toEqual(['urgency'])
    })

    it('records up to 3 questions in the order asked', () => {
      expect(customerPhase(play(FIRST, ask('told'), ask('purpose'), ask('next'))).asked).toEqual([
        'told',
        'purpose',
        'next',
      ])
    })

    it('ignores a fourth question (AC-3.2)', () => {
      const three = play(FIRST, ask('purpose'), ask('origin'), ask('urgency'))
      expect(reduce(three, ask('next'))).toBe(three)
    })

    it('ignores a question already asked (AC-3.3)', () => {
      const once = reduce(FIRST, ask('purpose'))
      expect(reduce(once, ask('purpose'))).toBe(once)
    })

    it('ignores a question the customer has no answer to', () => {
      // s1 is a cash customer, and `met` is not in the cash set.
      expect(reduce(FIRST, ask('met'))).toBe(FIRST)
    })

    it('ignores a question id that is not in the bank, even one an object has by default', () => {
      expect(reduce(FIRST, ask('toString' as QuestionId))).toBe(FIRST)
      expect(reduce(FIRST, ask('nope' as QuestionId))).toBe(FIRST)
    })
  })

  describe('decide (FR-6, AC-4.1, AC-4.2)', () => {
    const askedSoFar: QuestionId[][] = [[], ['purpose'], ['purpose', 'origin'], ['purpose', 'origin', 'told']]
    for (const asked of askedSoFar) {
      for (const action of [PROCESS, HOLD]) {
        const decision = action.type === 'decide' ? action.decision : ''
        it(`with ${asked.length} asked and ${decision}: records the questions and the call, moves on, and clears the questions`, () => {
          const before = play(FIRST, ...asked.map(ask))
          const after = customerPhase(reduce(before, action))
          expect(after.results).toEqual([{ asked, decision }])
          expect(after.index).toBe(1)
          expect(after.asked).toEqual([])
          expect(after.day).toBe(DAY)
        })
      }
    }

    it('ignores a decision that is neither process nor hold', () => {
      expect(reduce(FIRST, { type: 'decide', decision: 'maybe' } as unknown as Action)).toBe(FIRST)
    })

    it('on the sixth customer gives the debrief with all 6 results in order (FR-8, AC-6.1)', () => {
      const fifth = customerPhase(play(FIRST, HOLD, PROCESS, PROCESS, HOLD, PROCESS))
      expect(fifth.index).toBe(5)
      const debrief = play(fifth, ask('next'), HOLD)
      expect(debrief).toEqual({
        phase: 'debrief',
        day: DAY,
        results: [
          { asked: [], decision: 'hold' },
          { asked: [], decision: 'process' },
          { asked: [], decision: 'process' },
          { asked: [], decision: 'hold' },
          { asked: [], decision: 'process' },
          { asked: ['next'], decision: 'hold' },
        ],
      })
    })
  })

  describe('any other combination returns the state unchanged (AC-4.3)', () => {
    const debrief = play(FIRST, PROCESS, PROCESS, PROCESS, PROCESS, PROCESS, PROCESS)

    it('ask and decide do nothing on the start screen', () => {
      expect(reduce(START, ask('purpose'))).toBe(START)
      expect(reduce(START, PROCESS)).toBe(START)
      expect(reduce(START, HOLD)).toBe(START)
    })

    it('ask and decide do nothing on the debrief', () => {
      expect(debrief.phase).toBe('debrief')
      expect(reduce(debrief, ask('purpose'))).toBe(debrief)
      expect(reduce(debrief, PROCESS)).toBe(debrief)
      expect(reduce(debrief, HOLD)).toBe(debrief)
    })

    it('an unknown action type does nothing', () => {
      expect(reduce(FIRST, { type: 'goBack' } as unknown as Action)).toBe(FIRST)
    })

    it('no action lowers index during a day', () => {
      const rng = mulberry32(42)
      const questions: QuestionId[] = ['purpose', 'recipient', 'origin', 'urgency', 'next', 'met', 'verified', 'told']
      const actions: Action[] = [
        ...questions.map(ask),
        PROCESS,
        HOLD,
        { type: 'startDay', day: [...DAY].reverse() },
        { type: 'goBack' } as unknown as Action,
      ]
      let state: GameState = FIRST
      let steps = 0
      while (state.phase === 'customer') {
        const before = state.index
        state = reduce(state, actions[Math.floor(rng() * actions.length)])
        if (state.phase === 'customer') expect(state.index).toBeGreaterThanOrEqual(before)
        steps++
      }
      expect(state.phase).toBe('debrief')
      expect(steps).toBeGreaterThan(6)
    })
  })

  it('plays a whole scripted day from start to debrief', () => {
    let state = reduce(START, { type: 'startDay', day: DAY })
    // Customer 1 (cash scam): three questions, then a fourth that is ignored. Hold.
    state = play(state, ask('purpose'), ask('next'), ask('told'), ask('origin'), HOLD)
    // Customer 2 (wire, legit): asks met and verified, then repeats met. Process.
    state = play(state, ask('met'), ask('verified'), ask('met'), PROCESS)
    // Customer 3 (gift cards, legit): asks nothing. Process.
    state = play(state, PROCESS)
    // Customer 4 (wire scam): asks one question it has no answer to, then one it has. Process.
    state = play(state, ask('origin'), ask('recipient'), PROCESS)
    // Customer 5 (cash, legit): Hold.
    state = play(state, ask('urgency'), HOLD)
    expect(customerPhase(state).index).toBe(5)
    // Customer 6 (gift cards, legit): Process. This ends the day.
    state = play(state, ask('purpose'), ask('recipient'), PROCESS)

    expect(state).toEqual({
      phase: 'debrief',
      day: DAY,
      results: [
        { asked: ['purpose', 'next', 'told'], decision: 'hold' },
        { asked: ['met', 'verified'], decision: 'process' },
        { asked: [], decision: 'process' },
        { asked: ['recipient'], decision: 'process' },
        { asked: ['urgency'], decision: 'hold' },
        { asked: ['purpose', 'recipient'], decision: 'process' },
      ],
    })
  })
})
