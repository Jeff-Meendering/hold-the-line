// The schema: ids, customers, and the game state (design.md sections 1.1,
// 2.1, and 2.2). Content in src/data/ is written against these types, and
// validateData checks the same rules at runtime, because npm test does not
// check types (architecture.md T5).

// ---- Ids (design.md section 2.1) ----
// Each list is an `as const` array. The union type is derived from it, and
// validateData uses the array itself to check ids at runtime.

/** The question bank, in bank order. The wording is in src/data/questions.ts. */
export const QUESTION_IDS = [
  'purpose',
  'recipient',
  'origin',
  'urgency',
  'next',
  'met',
  'verified',
  'told',
] as const
export type QuestionId = (typeof QUESTION_IDS)[number]

export const TRANSACTION_TYPES = ['cash', 'wire', 'giftCards'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

/** The red flags in requirements.md section 7. */
export const RED_FLAG_IDS = [
  'RF-1', 'RF-2', 'RF-3', 'RF-4', 'RF-5', 'RF-6', 'RF-7', 'RF-8', 'RF-9',
  'RF-10', 'RF-11', 'RF-12', 'RF-13', 'RF-14', 'RF-15', 'RF-16', 'RF-17',
] as const
export type RedFlagId = (typeof RED_FLAG_IDS)[number]

/** Scam types as FinCEN names them (design.md S6). */
export const SCAM_TYPES = [
  'governmentImposter',
  'bankImpersonation',
  'romance',
  'emergency',
  'lottery',
  'techSupport',
] as const
export type ScamType = (typeof SCAM_TYPES)[number]

/** The only sites a source link may go to (V17, security.md SEC-13). */
export const SOURCE_HOSTS = [
  'consumer.ftc.gov',
  'www.ftc.gov',
  'www.fincen.gov',
  'www.aarp.org',
  'www.fbi.gov',
  'www.ic3.gov',
  'www.consumerfinance.gov',
  'www.cftc.gov',
] as const

// ---- Customers (design.md section 2.2) ----

interface SlipBase {
  /** Whole US dollars. */
  amount: number
  /** One line on the customer's usual activity (D5). */
  accountNote: string
}
export interface CashSlip extends SlipBase {
  type: 'cash'
}
export interface WireSlip extends SlipBase {
  type: 'wire'
  recipient: string
  /** Where the money is going, for example "Lisbon, Portugal". */
  destination: string
}
export interface GiftCardSlip extends SlipBase {
  type: 'giftCards'
  cardCount: number
  /** At most 500 (FR-13). amount must equal cardCount × valuePerCard. */
  valuePerCard: number
}
export type Slip = CashSlip | WireSlip | GiftCardSlip

export interface RedFlag {
  id: RedFlagId
  /** Where the player can notice it: on the slip, in the behaviour text,
   *  or in this customer's answer to the named question. */
  shownIn: 'slip' | 'behaviour' | QuestionId
}

interface CustomerBase {
  /** Stable and unique, for example "c03-wire-romance". Used in test messages. */
  id: string
  name: string
  slip: Slip
  /** What the teller sees and hears before asking anything. */
  behaviour: string
  /** An answer to each of the 5 questions in the slip type's set, and to no other. */
  answers: Partial<Record<QuestionId, string>>
  /** The debrief line. For a scam it names the scammer's tactic (AC-6.4). */
  explanation: string
}

export interface ScamCustomer extends CustomerBase {
  truth: 'scam'
  scamType: ScamType
  /** At least 3: at least 1 on the slip or in the behaviour, and the rest
   *  behind 1 or 2 questions (FR-14, FR-19). */
  redFlags: RedFlag[]
  /** At least 1 source for the scenario, checked in the fact-check.
   *  Each is https and on a host in SOURCE_HOSTS (V17). */
  sourceUrls: string[]
}

/** A legit customer's trait that looks like a red flag (FR-14). */
export interface LookAlike {
  /** The red flag it resembles. */
  flag: RedFlagId
  /** Where the player can notice it, as for a red flag. */
  shownIn: RedFlag['shownIn']
  /** The question whose answer explains it. Never the question in shownIn. */
  explainedBy: QuestionId
}

export interface LegitCustomer extends CustomerBase {
  truth: 'legit'
  lookAlike?: LookAlike
}

export type Customer = ScamCustomer | LegitCustomer

/** All that CustomerScreen is given. It leaves out the truth, flags, and explanation (FR-7). */
export type CustomerView = Pick<Customer, 'name' | 'slip' | 'behaviour' | 'answers'>

// ---- Game state (design.md section 1.1) ----

export type Decision = 'process' | 'hold'

/** What the player did with one customer. results[i] belongs to day[i]. */
export interface CustomerResult {
  asked: QuestionId[]
  decision: Decision
}

export type GameState =
  | { phase: 'start' }
  | {
      phase: 'customer'
      day: Customer[] // the 6 customers, in drawn order
      index: number // which customer is at the counter, from 0
      asked: QuestionId[] // questions asked of this customer so far
      results: CustomerResult[] // one per customer already decided
    }
  | { phase: 'debrief'; day: Customer[]; results: CustomerResult[] }

export type Action =
  | { type: 'startDay'; day: Customer[] }
  | { type: 'ask'; questionId: QuestionId }
  | { type: 'decide'; decision: Decision }

export const MAX_QUESTIONS = 3
