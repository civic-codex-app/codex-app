import { describe, it, expect } from 'vitest'
import {
  stanceStyle,
  stanceBucket,
  STANCE_STYLES,
  STANCE_NUMERIC,
  STANCE_ORDER,
  getStanceDisplay,
} from '@/lib/utils/stances'

describe('stanceStyle', () => {
  it('returns correct style for known stances', () => {
    expect(stanceStyle('supports').label).toBe('Progressive')
    expect(stanceStyle('opposes').label).toBe('Conservative')
    expect(stanceStyle('strongly_supports').label).toBe('Strong Progressive')
    expect(stanceStyle('neutral').label).toBe('Centrist')
    expect(stanceStyle('mixed').label).toBe('Mixed')
  })

  it('falls back to unknown for unrecognized stances', () => {
    expect(stanceStyle('garbage').label).toBe('Unknown')
    expect(stanceStyle('').label).toBe('Unknown')
  })

  it('returns all expected properties', () => {
    const s = stanceStyle('supports')
    expect(s).toHaveProperty('bg')
    expect(s).toHaveProperty('text')
    expect(s).toHaveProperty('label')
    expect(s).toHaveProperty('color')
    expect(s).toHaveProperty('shortLabel')
  })
})

describe('stanceBucket', () => {
  it('collapses support stances', () => {
    expect(stanceBucket('strongly_supports')).toBe('supports')
    expect(stanceBucket('supports')).toBe('supports')
    expect(stanceBucket('leans_support')).toBe('supports')
  })

  it('collapses oppose stances', () => {
    expect(stanceBucket('strongly_opposes')).toBe('opposes')
    expect(stanceBucket('opposes')).toBe('opposes')
    expect(stanceBucket('leans_oppose')).toBe('opposes')
  })

  it('handles neutral, mixed, and unknown', () => {
    expect(stanceBucket('neutral')).toBe('neutral')
    expect(stanceBucket('mixed')).toBe('mixed')
    expect(stanceBucket('unknown')).toBe('unknown')
    expect(stanceBucket('asdfgh')).toBe('unknown')
  })
})

describe('STANCE_NUMERIC', () => {
  it('maps stances to correct numeric values', () => {
    expect(STANCE_NUMERIC.strongly_supports).toBe(6)
    expect(STANCE_NUMERIC.supports).toBe(5)
    expect(STANCE_NUMERIC.leans_support).toBe(4)
    expect(STANCE_NUMERIC.neutral).toBe(3)
    expect(STANCE_NUMERIC.mixed).toBe(3)
    expect(STANCE_NUMERIC.leans_oppose).toBe(2)
    expect(STANCE_NUMERIC.opposes).toBe(1)
    expect(STANCE_NUMERIC.strongly_opposes).toBe(0)
    expect(STANCE_NUMERIC.unknown).toBe(-1)
  })

  it('has monotonically decreasing values from support to oppose', () => {
    const ordered = [
      STANCE_NUMERIC.strongly_supports,
      STANCE_NUMERIC.supports,
      STANCE_NUMERIC.leans_support,
      STANCE_NUMERIC.neutral,
      STANCE_NUMERIC.leans_oppose,
      STANCE_NUMERIC.opposes,
      STANCE_NUMERIC.strongly_opposes,
    ]
    for (let i = 0; i < ordered.length - 1; i++) {
      expect(ordered[i]).toBeGreaterThanOrEqual(ordered[i + 1])
    }
  })
})

describe('STANCE_ORDER', () => {
  it('has 9 entries covering all stance types', () => {
    expect(STANCE_ORDER).toHaveLength(9)
    expect(STANCE_ORDER).toContain('strongly_supports')
    expect(STANCE_ORDER).toContain('unknown')
  })
})

describe('STANCE_STYLES', () => {
  it('has an entry for every stance in STANCE_ORDER', () => {
    for (const stance of STANCE_ORDER) {
      expect(STANCE_STYLES[stance]).toBeDefined()
      expect(STANCE_STYLES[stance].color).toMatch(/^#/)
    }
  })
})

describe('getStanceDisplay', () => {
  it('maps support stances to Progressive', () => {
    expect(getStanceDisplay('supports').label).toBe('Progressive')
    expect(getStanceDisplay('strongly_supports').label).toBe('Progressive')
  })

  it('maps oppose stances to Conservative', () => {
    expect(getStanceDisplay('opposes').label).toBe('Conservative')
    expect(getStanceDisplay('strongly_opposes').label).toBe('Conservative')
  })

  it('maps neutral and mixed to Mixed', () => {
    expect(getStanceDisplay('neutral').label).toBe('Mixed')
    expect(getStanceDisplay('mixed').label).toBe('Mixed')
  })

  it('maps unknown values to Unknown', () => {
    expect(getStanceDisplay('unknown').label).toBe('Unknown')
    expect(getStanceDisplay('garbage').label).toBe('Unknown')
  })
})
