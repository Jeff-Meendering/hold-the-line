// Display text for each red flag id, scam type, and transaction type (FR-9,
// design.md section 2.3). A Record over an id type will not compile with an
// id missing.
import type { RedFlagId, ScamType, TransactionType } from '../game/types.ts'

/** One short phrase per red flag, about 8 words, cut down from the "What the
 *  player can notice" column of requirements.md section 7. The debrief shows
 *  the same label for the same flag on every customer (D15), and for a legit
 *  look-alike's trait. */
export const RED_FLAG_LABELS: Record<RedFlagId, string> = {
  'RF-1': 'On the phone during the transaction, taking directions',
  'RF-2': 'Fearful, distressed, or anxious to do as told',
  'RF-3': 'The story changes, or a question goes unanswered',
  'RF-4': 'Suddenly unwilling to talk about the money',
  'RF-5': "A loved one's emergency, but a stranger gets paid",
  'RF-6': 'Was told to keep it secret',
  'RF-7': 'Says the account is compromised and money must move',
  'RF-8': 'Large cash withdrawal, unusual for the account',
  'RF-9': 'Large wire, unusual for the account',
  'RF-10': 'Closing a CD or savings early despite the penalty',
  'RF-11': 'Buying many gift cards at once',
  'RF-12': 'Gift cards as payment, or their numbers passed on',
  'RF-13': 'The money is for someone met only online',
  'RF-14': 'For tech support, a refund, prize fees, or taxes',
  'RF-15': 'The cash is going into a crypto ATM',
  'RF-16': 'Cash or gold handed to someone who collects it',
  'RF-17': 'Was told what to say, or to lie',
}

/** Shown on the debrief as "It was a scam: <label>." (design.md section 3.4). */
export const SCAM_TYPE_LABELS: Record<ScamType, string> = {
  governmentImposter: 'government imposter scam',
  bankImpersonation: 'bank impersonation scam',
  romance: 'romance scam',
  emergency: 'family emergency scam',
  lottery: 'lottery or sweepstakes scam',
  techSupport: 'tech support scam',
}

/** The start of the debrief's transaction line, as in "Wire: $18,400 to …"
 *  (design.md section 3.4). */
export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  cash: 'Cash withdrawal',
  wire: 'Wire',
  giftCards: 'Gift cards',
}

/** The title printed at the top of the slip on the customer screen
 *  (design.md section 3.3). */
export const SLIP_TITLES: Record<TransactionType, string> = {
  cash: 'CASH WITHDRAWAL',
  wire: 'WIRE TRANSFER',
  giftCards: 'GIFT CARD PURCHASE',
}
