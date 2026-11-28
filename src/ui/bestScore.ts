// The best score: one number in localStorage (FR-17, NFR-2, architecture
// T11). This is the only file that touches browser storage (SEC-16). The
// stored value is not trusted (SEC-17), and every storage call is inside a
// try/catch, so the game plays normally when storage is missing or throws.

export const BEST_SCORE_KEY = 'hold-the-line:best-score'

/** The two calls this file makes, so the tests can pass a stand-in. */
export type ScoreStorage = Pick<Storage, 'getItem' | 'setItem'>

/** What the start screen and the debrief know about the best score.
 *  `available: false` means storage could not be read, so nothing is shown. */
export type StoredBest = { available: false } | { available: true; best: number | null }

function browserStorage(): ScoreStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** A whole number from 0 to 60, written plainly, or null for anything else
 *  (SEC-17). "07", "12.5", "-10", "999", and "" are all null. */
export function parseBestScore(raw: string | null): number | null {
  if (raw === null || !/^(?:[0-9]|[1-5][0-9]|60)$/.test(raw)) return null
  return Number(raw)
}

export function loadBestScore(storage: ScoreStorage | null = browserStorage()): StoredBest {
  try {
    if (storage === null) return { available: false }
    return { available: true, best: parseBestScore(storage.getItem(BEST_SCORE_KEY)) }
  } catch {
    return { available: false }
  }
}

/** Writes the best score and says whether it was saved. Reading can work
 *  while writing throws, as when storage is full, so a caller cannot take
 *  the save for granted (SEC-17). */
export function saveBestScore(score: number, storage: ScoreStorage | null = browserStorage()): boolean {
  try {
    if (storage === null) return false
    storage.setItem(BEST_SCORE_KEY, String(score))
    return true
  } catch {
    // Storage is full, blocked, or missing. The game carries on without it.
    return false
  }
}

/** The best score after a finished day. The first finished day sets it,
 *  whatever the score (D33). After that only a higher score replaces it, and
 *  a tie is not a new best. */
export function nextBest(previous: number | null, score: number): { best: number; isNew: boolean } {
  if (previous === null || score > previous) return { best: score, isNew: true }
  return { best: previous, isNew: false }
}

/** The debrief's best-score line, from nextBest and the save. `saved` is null
 *  before the save has been tried. A new best is shown only once it has been
 *  saved, so a score that will not be there after a reload is never called
 *  the best. If the save fails there is no line, as when there is no storage
 *  (FR-17, AC-9.1). */
export function bestScoreLine(result: { best: number; isNew: boolean } | null, saved: boolean | null): string | null {
  if (result === null) return null
  if (!result.isNew) return `Best score: ${result.best} / 60`
  return saved === true ? 'New best score' : null
}
