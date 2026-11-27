// The scoring table and the floor at 0 (requirements.md section 5, D1, D2).
import type { Customer, CustomerResult, Decision } from './types.ts'

/** Points for one customer: the four rows of the scoring table. */
export function pointsFor(truth: Customer['truth'], decision: Decision): number {
  if (truth === 'legit') return decision === 'process' ? 10 : -5
  return decision === 'hold' ? 10 : -20
}

/** The points for each customer added up, before the floor. results[i]
 *  belongs to day[i], so the two must be the same length. */
export function sumPoints(day: readonly Customer[], results: readonly CustomerResult[]): number {
  if (day.length !== results.length) {
    throw new Error(`a day of ${day.length} customers has ${results.length} results`)
  }
  return day.reduce((sum, customer, i) => sum + pointsFor(customer.truth, results[i].decision), 0)
}

/** The day score: the sum over the customers, shown as 0 if it is below 0. */
export function scoreDay(day: readonly Customer[], results: readonly CustomerResult[]): number {
  return Math.max(0, sumPoints(day, results))
}
