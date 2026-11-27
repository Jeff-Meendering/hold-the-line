// The content rules V1 to V17 (design.md section 2.6, FR-15). npm test does
// not check types, so this reads its input as unknown values and never
// trusts the shape the types promise (architecture.md T5). It never throws
// on bad content: every problem becomes a message.
//
// Every message is "<subject>: <rule> <what is wrong>". The subject is the
// customer id or the question id the message is about. A rule about a
// transaction type's question set starts with the type, a rule about the
// whole pool starts with `pool` (D32), and a customer with no id is named by
// its place in the list, as in `customers[3]`.
import { QUESTION_IDS, RED_FLAG_IDS, SCAM_TYPES, SOURCE_HOSTS, TRANSACTION_TYPES } from './types.ts'
import type { Customer, QuestionId, TransactionType } from './types.ts'

/** Everything validateData checks: the question bank, the sets, and the pool. */
export interface GameContent {
  questionText: Readonly<Record<QuestionId, string>>
  questionSets: Readonly<Record<TransactionType, readonly QuestionId[]>>
  customers: readonly Customer[]
}

type Obj = Record<string, unknown>
type Say = (subject: string, rule: string, text: string) => void

const MIN_RED_FLAGS = 3
const MAX_FLAGGED_QUESTIONS = 2
const MAX_VALUE_PER_CARD = 500
const SET_SIZE = 5
const MIN_SCAMS = 3
const MIN_LEGIT = 5
const MIN_LOOK_ALIKES = 3
const MIN_LOOK_ALIKES_IN_AN_ANSWER = 2
const MAX_TOLD_ADMISSIONS = 1
const ADMISSION_FLAGS = ['RF-6', 'RF-17']

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const filled = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === 'string' && (list as readonly string[]).includes(v)
const show = (v: unknown): string => (typeof v === 'string' ? `"${v}"` : String(JSON.stringify(v)))
const listOf = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const count = (n: number, noun: string): string => `${n} ${noun}${n === 1 ? '' : 's'}`

export function validateData(data: GameContent): string[] {
  const messages: string[] = []
  const say: Say = (subject, rule, text) => {
    messages.push(`${subject}: ${rule} ${text}`)
  }
  const content: Obj = isObj(data) ? data : {}

  checkWording(content.questionText, say)
  const sets = checkSets(content.questionSets, say)

  if (!Array.isArray(content.customers)) {
    say('pool', 'V10', 'has no list of customers')
    return messages
  }
  const customers: unknown[] = content.customers
  const named = customers.map((c, i) => ({
    c: isObj(c) ? c : undefined,
    subject: isObj(c) && filled(c.id) ? c.id : `customers[${i}]`,
  }))

  for (const { c, subject } of named) {
    if (c === undefined) say(subject, 'V4', 'is not an object')
    else checkCustomer(c, subject, sets, say)
  }
  checkDuplicateIds(named, say)
  checkPool(named, say)
  return messages
}

// ---- Bank: V1 to V3 ----

/** V1. QUESTION_IDS is the bank: 8 different ids by construction. This
 *  checks the wording against it. */
function checkWording(questionText: unknown, say: Say): void {
  const text = isObj(questionText) ? questionText : {}
  for (const q of QUESTION_IDS) {
    if (!filled(text[q])) say(q, 'V1', 'has no wording')
  }
  for (const key of Object.keys(text)) {
    if (!oneOf(QUESTION_IDS, key)) say(key, 'V1', 'has wording but is not a bank question id')
  }
}

/** V2 and V3. Returns each type's set with anything that is not a bank id
 *  left out, for the customer checks. */
function checkSets(questionSets: unknown, say: Say): Map<TransactionType, QuestionId[]> {
  const raw = isObj(questionSets) ? questionSets : {}
  const sets = new Map<TransactionType, QuestionId[]>()

  for (const type of TRANSACTION_TYPES) {
    const set = raw[type]
    if (!Array.isArray(set)) {
      say(type, 'V2', 'has no question set')
      continue
    }
    if (set.length !== SET_SIZE) say(type, 'V2', `set has ${count(set.length, 'question')}, not ${SET_SIZE}`)
    const seen = new Set<unknown>()
    for (const q of set) {
      if (!oneOf(QUESTION_IDS, q)) say(type, 'V2', `set has ${show(q)}, which is not a bank question`)
      else if (seen.has(q)) say(type, 'V2', `set has ${q} twice`)
      seen.add(q)
    }
    sets.set(type, [...new Set(set.filter((q): q is QuestionId => oneOf(QUESTION_IDS, q)))])
  }
  for (const key of Object.keys(raw)) {
    if (!oneOf(TRANSACTION_TYPES, key)) say(key, 'V2', 'has a question set but is not a transaction type')
  }

  for (const q of QUESTION_IDS) {
    if (![...sets.values()].some((set) => set.includes(q))) say(q, 'V3', 'is in no question set')
  }
  return sets
}

// ---- Each customer: V4 to V9, V14, V17 ----

function checkCustomer(c: Obj, subject: string, sets: Map<TransactionType, QuestionId[]>, say: Say): void {
  // V4
  if (!filled(c.id)) say(subject, 'V4', 'has no id')
  if (!filled(c.name)) say(subject, 'V4', 'has no name')
  if (!filled(c.behaviour)) say(subject, 'V4', 'has no behaviour text')
  if (!filled(c.explanation)) say(subject, 'V4', 'has no explanation')
  if (c.truth !== 'scam' && c.truth !== 'legit') say(subject, 'V4', `has truth ${show(c.truth)}, not "scam" or "legit"`)

  const slip = isObj(c.slip) ? c.slip : undefined
  if (slip === undefined) {
    say(subject, 'V4', 'has no slip')
  } else {
    if (!filled(slip.accountNote)) say(subject, 'V4', 'has no account note')
    if (!(Number.isInteger(slip.amount) && (slip.amount as number) > 0)) {
      say(subject, 'V4', `has amount ${show(slip.amount)}, not a whole number above 0`)
    }
    checkSlipType(slip, subject, say)
  }

  const type = oneOf(TRANSACTION_TYPES, slip?.type) ? slip.type : undefined
  const set = type === undefined ? undefined : sets.get(type)
  if (type !== undefined && set !== undefined) checkAnswers(c.answers, type, set, subject, say)

  if (c.truth === 'scam') checkScam(c, subject, type, set, say)
  if (c.truth === 'legit') checkLookAlike(c.lookAlike, subject, type, set, say)
}

/** V6. */
function checkSlipType(slip: Obj, subject: string, say: Say): void {
  if (slip.type === 'wire') {
    if (!filled(slip.recipient)) say(subject, 'V6', 'is a wire with no recipient')
    if (!filled(slip.destination)) say(subject, 'V6', 'is a wire with no destination')
  } else if (slip.type === 'giftCards') {
    const { cardCount, valuePerCard, amount } = slip
    const countOk = Number.isInteger(cardCount) && (cardCount as number) > 0
    const valueOk = typeof valuePerCard === 'number' && valuePerCard > 0 && valuePerCard <= MAX_VALUE_PER_CARD
    if (!countOk) say(subject, 'V6', `has ${show(cardCount)} gift cards, not a whole number above 0`)
    if (!valueOk) say(subject, 'V6', `has ${show(valuePerCard)} per gift card, not above 0 and at most ${MAX_VALUE_PER_CARD}`)
    if (countOk && valueOk && amount !== (cardCount as number) * valuePerCard) {
      say(subject, 'V6', `has amount ${show(amount)}, not ${show(cardCount)} × ${show(valuePerCard)}`)
    }
  } else if (slip.type !== 'cash') {
    say(subject, 'V6', `has slip type ${show(slip.type)}, not one of ${TRANSACTION_TYPES.join(', ')}`)
  }
}

/** V5. */
function checkAnswers(answers: unknown, type: TransactionType, set: QuestionId[], subject: string, say: Say): void {
  if (!isObj(answers)) {
    say(subject, 'V5', 'has no answers')
    return
  }
  for (const q of set) {
    if (!Object.hasOwn(answers, q)) say(subject, 'V5', `has no answer to ${q}, which is in the ${type} set`)
    else if (!filled(answers[q])) say(subject, 'V5', `has an empty answer to ${q}`)
  }
  for (const key of Object.keys(answers)) {
    if (!(set as string[]).includes(key)) say(subject, 'V5', `answers ${show(key)}, which is not in the ${type} set`)
  }
}

/** Whether a place is the slip, the behaviour, or a question in the set. */
function placeOk(shownIn: unknown, set: QuestionId[] | undefined): boolean {
  if (shownIn === 'slip' || shownIn === 'behaviour') return true
  return set === undefined ? oneOf(QUESTION_IDS, shownIn) : oneOf(set, shownIn)
}

/** V7, V8, V14, V17. */
function checkScam(c: Obj, subject: string, type: TransactionType | undefined, set: QuestionId[] | undefined, say: Say): void {
  if (!oneOf(SCAM_TYPES, c.scamType)) say(subject, 'V7', `has scam type ${show(c.scamType)}, which is not a known one`)

  // V7 and V17: the source URLs.
  if (!Array.isArray(c.sourceUrls) || c.sourceUrls.length === 0) {
    say(subject, 'V7', 'has no source URL')
  } else {
    for (const url of c.sourceUrls as unknown[]) checkSourceUrl(url, subject, say)
  }

  // V7: the red flags themselves.
  if (!Array.isArray(c.redFlags)) {
    say(subject, 'V7', 'has no red flags')
    return
  }
  const flags = (c.redFlags as unknown[]).map((f) => (isObj(f) ? f : {}))
  if (flags.length < MIN_RED_FLAGS) say(subject, 'V7', `has ${count(flags.length, 'red flag')}, needs at least ${MIN_RED_FLAGS}`)
  const seen = new Set<unknown>()
  for (const flag of flags) {
    if (!oneOf(RED_FLAG_IDS, flag.id)) say(subject, 'V7', `has red flag ${show(flag.id)}, which is not a known id`)
    else if (seen.has(flag.id)) say(subject, 'V7', `has red flag ${flag.id} twice`)
    seen.add(flag.id)
  }

  // V8: where each flag shows.
  const where = type === undefined ? 'a question in its set' : `a question in the ${type} set`
  for (const flag of flags) {
    if (!placeOk(flag.shownIn, set)) {
      say(subject, 'V8', `has red flag ${show(flag.id)} in ${show(flag.shownIn)}, not the slip, the behaviour, or ${where}`)
    }
  }
  const upFront = flags.filter((f) => f.shownIn === 'slip' || f.shownIn === 'behaviour')
  const behind = flags.filter((f) => oneOf(QUESTION_IDS, f.shownIn))
  if (upFront.length === 0) say(subject, 'V8', 'has no red flag on the slip or in the behaviour')
  if (behind.length === 0) say(subject, 'V8', 'has no red flag behind a question')

  // V14: the cover story leaves at most 2 answers flagged.
  const questions = [...new Set(behind.map((f) => f.shownIn as QuestionId))]
  if (questions.length > MAX_FLAGGED_QUESTIONS) {
    say(
      subject,
      'V14',
      `has red flags behind ${questions.length} questions (${questions.join(', ')}), and the most is ${MAX_FLAGGED_QUESTIONS}`,
    )
  }
}

/** V17. The check is on the parsed hostname, never on how the text starts,
 *  so a host that only begins with an approved one fails (SEC-13). */
function checkSourceUrl(url: unknown, subject: string, say: Say): void {
  if (typeof url !== 'string') {
    say(subject, 'V17', `has source URL ${show(url)}, which is not text`)
    return
  }
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    say(subject, 'V17', `has source URL ${show(url)}, which is not a URL`)
    return
  }
  if (parsed.protocol !== 'https:') say(subject, 'V17', `has source URL ${show(url)}, which is not https`)
  if (!oneOf(SOURCE_HOSTS, parsed.hostname)) {
    say(subject, 'V17', `has source URL ${show(url)} on ${show(parsed.hostname)}, which is not an approved host`)
  }
}

/** V9. */
function checkLookAlike(lookAlike: unknown, subject: string, type: TransactionType | undefined, set: QuestionId[] | undefined, say: Say): void {
  if (lookAlike === undefined) return
  if (!isObj(lookAlike)) {
    say(subject, 'V9', 'has a look-alike that is not an object')
    return
  }
  const where = type === undefined ? 'its set' : `the ${type} set`
  const { flag, shownIn, explainedBy } = lookAlike
  if (!oneOf(RED_FLAG_IDS, flag)) say(subject, 'V9', `has a look-alike of ${show(flag)}, which is not a known red flag`)
  if (!placeOk(shownIn, set)) {
    say(subject, 'V9', `has a look-alike in ${show(shownIn)}, not the slip, the behaviour, or a question in ${where}`)
  }
  if (!(set === undefined ? oneOf(QUESTION_IDS, explainedBy) : oneOf(set, explainedBy))) {
    say(subject, 'V9', `has a look-alike explained by ${show(explainedBy)}, which is not a question in ${where}`)
  } else if (explainedBy === shownIn) {
    say(subject, 'V9', `has a look-alike explained by ${explainedBy}, the same question it shows in`)
  }
}

// ---- Ids across customers: V4 ----

function checkDuplicateIds(named: { c: Obj | undefined }[], say: Say): void {
  const counts = new Map<string, number>()
  for (const { c } of named) {
    if (c !== undefined && filled(c.id)) counts.set(c.id, (counts.get(c.id) ?? 0) + 1)
  }
  for (const [id, n] of counts) {
    if (n > 1) say(id, 'V4', `is the id of ${n} customers`)
  }
}

// ---- Pool: V10 to V13, V15, V16 ----

function checkPool(named: { c: Obj | undefined; subject: string }[], say: Say): void {
  const all = named.filter((n): n is { c: Obj; subject: string } => n.c !== undefined)
  const scams = all.filter((n) => n.c.truth === 'scam')
  const legits = all.filter((n) => n.c.truth === 'legit')
  const names = (list: { subject: string }[]) => (list.length === 0 ? 'none' : list.map((n) => n.subject).join(', '))
  const slipType = (c: Obj) => (isObj(c.slip) ? c.slip.type : undefined)

  // V10
  if (scams.length < MIN_SCAMS) say('pool', 'V10', `has ${count(scams.length, 'scam customer')}, needs at least ${MIN_SCAMS}`)
  if (legits.length < MIN_LEGIT) say('pool', 'V10', `has ${count(legits.length, 'legit customer')}, needs at least ${MIN_LEGIT}`)

  // V11
  for (const type of TRANSACTION_TYPES) {
    if (!scams.some((n) => slipType(n.c) === type)) say('pool', 'V11', `has no scam customer with a ${type} slip`)
    if (!legits.some((n) => slipType(n.c) === type)) say('pool', 'V11', `has no legit customer with a ${type} slip`)
  }

  // V12
  for (const scamType of SCAM_TYPES) {
    const same = scams.filter((n) => n.c.scamType === scamType)
    if (same.length > 1) say('pool', 'V12', `has ${same.length} scam customers with the scam type ${scamType}: ${names(same)}`)
  }

  // V13
  const lookAlikes = legits.filter((n) => isObj(n.c.lookAlike))
  if (lookAlikes.length < MIN_LOOK_ALIKES) {
    say('pool', 'V13', `has ${count(lookAlikes.length, 'legit customer')} with a look-alike (${names(lookAlikes)}), needs at least ${MIN_LOOK_ALIKES}`)
  }

  // V15
  const admits = scams.filter((n) =>
    listOf(n.c.redFlags).some((f) => isObj(f) && f.shownIn === 'told' && ADMISSION_FLAGS.includes(f.id as string)),
  )
  if (admits.length > MAX_TOLD_ADMISSIONS) {
    say('pool', 'V15', `has ${count(admits.length, 'scam customer')} with RF-6 or RF-17 behind told (${names(admits)}), and the most is ${MAX_TOLD_ADMISSIONS}`)
  }

  // V16
  const inAnswer = lookAlikes.filter((n) => oneOf(QUESTION_IDS, (n.c.lookAlike as Obj).shownIn))
  if (inAnswer.length < MIN_LOOK_ALIKES_IN_AN_ANSWER) {
    say(
      'pool',
      'V16',
      `has ${count(inAnswer.length, 'legit customer')} with a look-alike in an answer (${names(inAnswer)}), needs at least ${MIN_LOOK_ALIKES_IN_AN_ANSWER}`,
    )
  }
}
