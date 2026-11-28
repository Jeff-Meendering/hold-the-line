import { describe, expect, it } from 'vitest'
import { BEST_SCORE_KEY, loadBestScore, nextBest, parseBestScore, saveBestScore } from './bestScore.ts'
import type { ScoreStorage } from './bestScore.ts'

// The best score (FR-17, SEC-16, SEC-17, D33). Vitest runs in Node, which has
// no localStorage, so each test passes a small stand-in.

function memoryStorage(initial: Record<string, string> = {}): ScoreStorage & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (Object.hasOwn(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value
    },
  }
}

const throwing: ScoreStorage = {
  getItem: () => {
    throw new Error('storage is disabled')
  },
  setItem: () => {
    throw new Error('storage is disabled')
  },
}

describe('parseBestScore (SEC-17)', () => {
  it('accepts every whole number from 0 to 60', () => {
    for (let n = 0; n <= 60; n++) expect(parseBestScore(String(n))).toBe(n)
  })

  it('rejects anything else, including the values in MT-23', () => {
    for (const raw of [null, '', ' ', '61', '999', '-10', '12.5', 'abc', '07', '1e1', ' 30', '30 ', '<img src=x onerror=alert(1)>']) {
      expect(parseBestScore(raw), String(raw)).toBeNull()
    }
  })
})

describe('loadBestScore and saveBestScore', () => {
  it('uses the one key, hold-the-line:best-score (SEC-16)', () => {
    const storage = memoryStorage()
    saveBestScore(45, storage)
    expect(storage.data).toEqual({ [BEST_SCORE_KEY]: '45' })
    expect(BEST_SCORE_KEY).toBe('hold-the-line:best-score')
    expect(loadBestScore(storage)).toEqual({ available: true, best: 45 })
  })

  it('reads an empty storage as no best score', () => {
    expect(loadBestScore(memoryStorage())).toEqual({ available: true, best: null })
  })

  it('reads a bad stored value as no best score', () => {
    expect(loadBestScore(memoryStorage({ [BEST_SCORE_KEY]: '999' }))).toEqual({ available: true, best: null })
  })

  it('reports storage it cannot read as unavailable, and does not throw (FR-17)', () => {
    expect(loadBestScore(throwing)).toEqual({ available: false })
    expect(loadBestScore(null)).toEqual({ available: false })
    expect(() => saveBestScore(30, throwing)).not.toThrow()
    expect(() => saveBestScore(30, null)).not.toThrow()
  })

  it('finds no storage in Node, where there is no window, and does not throw', () => {
    expect(loadBestScore()).toEqual({ available: false })
    expect(() => saveBestScore(30)).not.toThrow()
  })
})

describe('nextBest (D33, AC-9.1)', () => {
  it('makes the first finished day the best, whatever the score', () => {
    expect(nextBest(null, 0)).toEqual({ best: 0, isNew: true })
    expect(nextBest(null, 30)).toEqual({ best: 30, isNew: true })
  })

  it('replaces the best only with a higher score', () => {
    expect(nextBest(30, 45)).toEqual({ best: 45, isNew: true })
    expect(nextBest(30, 15)).toEqual({ best: 30, isNew: false })
  })

  it('does not count a tie as a new best', () => {
    expect(nextBest(45, 45)).toEqual({ best: 45, isNew: false })
  })
})
