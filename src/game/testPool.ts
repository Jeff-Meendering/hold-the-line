// Made-up customers for the unit tests (test-plan.md section 1, rule 2).
// Every text is a placeholder, so no test breaks when a real customer is
// rewritten. Only src/data/data.test.ts reads the real content.
//
// This file is not a test, so the rules test reads it like any other file in
// src/game/. It holds no source URLs, because web addresses may appear only
// in src/data/customers.ts. validate.test.ts adds its own.
import { QUESTION_IDS } from './types.ts'
import type {
  Customer,
  LegitCustomer,
  QuestionId,
  RedFlag,
  ScamCustomer,
  Slip,
  TransactionType,
} from './types.ts'

/** The same three sets as the locked design (D14), written out here so the
 *  tests do not read src/data/questions.ts. */
export const TEST_QUESTION_SETS: Record<TransactionType, readonly QuestionId[]> = {
  cash: ['purpose', 'origin', 'urgency', 'next', 'told'],
  wire: ['purpose', 'recipient', 'met', 'verified', 'told'],
  giftCards: ['purpose', 'recipient', 'urgency', 'next', 'told'],
}

export const TEST_QUESTION_TEXT = Object.fromEntries(
  QUESTION_IDS.map((q) => [q, `Placeholder question ${q}?`]),
) as Record<QuestionId, string>

export function testSlip(type: TransactionType): Slip {
  const accountNote = 'Placeholder usual activity.'
  switch (type) {
    case 'cash':
      return { type, amount: 900, accountNote }
    case 'wire':
      return { type, amount: 1800, accountNote, recipient: 'Placeholder recipient', destination: 'Placeholder city' }
    case 'giftCards':
      return { type, amount: 1500, accountNote, cardCount: 3, valuePerCard: 500 }
  }
}

/** A placeholder answer to each question in the type's set, and to no other. */
export function testAnswers(type: TransactionType): Partial<Record<QuestionId, string>> {
  return Object.fromEntries(TEST_QUESTION_SETS[type].map((q) => [q, `Placeholder answer to ${q}.`]))
}

/** Three flags that pass V7, V8, and V14: one on the slip, one in the
 *  behaviour, and one behind `purpose`, which is in every set. */
function testFlags(type: TransactionType): RedFlag[] {
  const slipFlag = { cash: 'RF-8', wire: 'RF-9', giftCards: 'RF-11' } as const
  return [
    { id: slipFlag[type], shownIn: 'slip' },
    { id: 'RF-1', shownIn: 'behaviour' },
    { id: 'RF-5', shownIn: 'purpose' },
  ]
}

export function scam(id: string, type: TransactionType = 'cash', overrides: Partial<ScamCustomer> = {}): ScamCustomer {
  return {
    id,
    name: `Placeholder name ${id}`,
    truth: 'scam',
    scamType: 'romance',
    slip: testSlip(type),
    behaviour: 'Placeholder behaviour.',
    answers: testAnswers(type),
    explanation: 'Placeholder explanation.',
    redFlags: testFlags(type),
    sourceUrls: [],
    ...overrides,
  }
}

export function legit(id: string, type: TransactionType = 'cash', overrides: Partial<LegitCustomer> = {}): LegitCustomer {
  return {
    id,
    name: `Placeholder name ${id}`,
    truth: 'legit',
    slip: testSlip(type),
    behaviour: 'Placeholder behaviour.',
    answers: testAnswers(type),
    explanation: 'Placeholder explanation.',
    ...overrides,
  }
}

/** A pool of `scams` scam customers (s1, s2, …) and `legits` legit customers
 *  (l1, l2, …), their transaction types taking turns. */
export function testPool(scams: number, legits: number): Customer[] {
  const types = ['cash', 'wire', 'giftCards'] as const
  return [
    ...Array.from({ length: scams }, (_, i) => scam(`s${i + 1}`, types[i % 3])),
    ...Array.from({ length: legits }, (_, i) => legit(`l${i + 1}`, types[i % 3])),
  ]
}
