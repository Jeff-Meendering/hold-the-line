// Display text for each red flag id, scam type, and transaction type (FR-9,
// design.md section 2.3). A Record over an id type will not compile with an
// id missing.
import type { RedFlagId, ScamType, TransactionType } from '../game/types.ts'

/** One short phrase per red flag, from the "What the player can notice"
 *  column of requirements.md section 7. The debrief shows the same label for
 *  the same flag on every customer (D15). */
export const RED_FLAG_LABELS: Record<RedFlagId, string> = {
  'RF-1': 'On the phone during the transaction, taking directions, will not hang up',
  'RF-2': 'Fearful, distressed, or anxious to do as told',
  'RF-3': 'The reason changes, or basic questions go unanswered',
  'RF-4': 'Suddenly unwilling to talk about the money',
  'RF-5': "Money must go now for a loved one's emergency, but to a stranger",
  'RF-6': 'Was told to keep it secret',
  'RF-7': 'Says the account is compromised and the money must be moved to keep it safe',
  'RF-8': 'Large cash withdrawal that does not fit the account',
  'RF-9': 'Large wire that does not fit the account',
  'RF-10': 'Cashing in a CD or closing savings early despite the penalty',
  'RF-11': 'Buying many gift cards at once',
  'RF-12': 'The gift cards are to pay someone, or the numbers will be read to someone',
  'RF-13': 'The money is for someone they have only met online',
  'RF-14': 'The payment is for tech support, a refund sent "by mistake", prize fees, or taxes owed to a caller',
  'RF-15': 'The cash is going into a crypto ATM',
  'RF-16': 'The cash, or gold bought with it, will be handed to someone who collects it',
  'RF-17': 'Says someone told them to lie to the bank, or told them what to say',
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
