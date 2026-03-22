import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveQuizAnswers,
  loadQuizAnswers,
  saveQuizStep,
  loadQuizStep,
  saveQuizResults,
  loadQuizResults,
  clearQuizProgress,
  mergeQuizAnswers,
} from '@/lib/utils/quiz-storage'

// Mock localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k] }),
  length: 0,
  key: vi.fn(() => null),
}

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
  vi.clearAllMocks()
})

describe('quiz answers (localStorage)', () => {
  it('saves and loads answers', () => {
    const answers = { 'healthcare': 'supports', 'economy': 'opposes' }
    saveQuizAnswers(answers)
    expect(loadQuizAnswers()).toEqual(answers)
  })

  it('returns empty object when nothing stored', () => {
    expect(loadQuizAnswers()).toEqual({})
  })

  it('handles JSON parse errors gracefully', () => {
    store['codex_quiz_answers'] = '{invalid json'
    expect(loadQuizAnswers()).toEqual({})
  })
})

describe('quiz step (localStorage)', () => {
  it('saves and loads step', () => {
    saveQuizStep(5)
    expect(loadQuizStep()).toBe(5)
  })

  it('returns 0 when nothing stored', () => {
    expect(loadQuizStep()).toBe(0)
  })
})

describe('quiz results (localStorage)', () => {
  it('saves and loads results', () => {
    const results = [{ name: 'test', score: 80 }]
    const stateResults = [{ name: 'state', score: 70 }]
    saveQuizResults(results, stateResults)
    const loaded = loadQuizResults()
    expect(loaded).not.toBeNull()
    expect(loaded!.results).toEqual(results)
    expect(loaded!.stateResults).toEqual(stateResults)
  })

  it('returns null when nothing stored', () => {
    expect(loadQuizResults()).toBeNull()
  })

  it('returns null for expired results (>24h)', () => {
    store['codex_quiz_results'] = JSON.stringify({
      results: [],
      stateResults: [],
      savedAt: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
    })
    expect(loadQuizResults()).toBeNull()
  })

  it('returns results within 24h window', () => {
    store['codex_quiz_results'] = JSON.stringify({
      results: [{ name: 'test' }],
      stateResults: [],
      savedAt: Date.now() - 23 * 60 * 60 * 1000, // 23 hours ago
    })
    const loaded = loadQuizResults()
    expect(loaded).not.toBeNull()
    expect(loaded!.results).toHaveLength(1)
  })
})

describe('clearQuizProgress', () => {
  it('removes all quiz keys', () => {
    saveQuizAnswers({ 'a': 'b' })
    saveQuizStep(3)
    saveQuizResults([], [])
    clearQuizProgress()
    expect(loadQuizAnswers()).toEqual({})
    expect(loadQuizStep()).toBe(0)
    expect(loadQuizResults()).toBeNull()
  })
})

describe('mergeQuizAnswers', () => {
  it('returns local when server is null', () => {
    const local = { 'a': 'supports' }
    expect(mergeQuizAnswers(local, null)).toEqual(local)
  })

  it('server wins when it has more answers', () => {
    const local = { 'a': 'supports' }
    const server = { 'a': 'opposes', 'b': 'neutral' }
    const merged = mergeQuizAnswers(local, server)
    expect(merged).toEqual({ 'a': 'opposes', 'b': 'neutral' })
  })

  it('local wins when it has more answers', () => {
    const local = { 'a': 'supports', 'b': 'neutral', 'c': 'opposes' }
    const server = { 'a': 'opposes' }
    const merged = mergeQuizAnswers(local, server)
    expect(merged).toEqual({ 'a': 'supports', 'b': 'neutral', 'c': 'opposes' })
  })

  it('server wins ties on equal count', () => {
    const local = { 'a': 'supports', 'b': 'neutral' }
    const server = { 'a': 'opposes', 'b': 'mixed' }
    const merged = mergeQuizAnswers(local, server)
    expect(merged.a).toBe('opposes')
    expect(merged.b).toBe('mixed')
  })

  it('merges disjoint keys on equal count', () => {
    const local = { 'a': 'supports' }
    const server = { 'b': 'opposes' }
    const merged = mergeQuizAnswers(local, server)
    expect(merged).toEqual({ 'a': 'supports', 'b': 'opposes' })
  })

  it('handles empty objects', () => {
    expect(mergeQuizAnswers({}, {})).toEqual({})
    expect(mergeQuizAnswers({}, null)).toEqual({})
  })
})
