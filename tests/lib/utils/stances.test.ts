import { describe, it, expect } from 'vitest'
import {
  stanceStyle,
  stanceBucket,
  stanceDisplayBadge,
  STANCE_STYLES,
  STANCE_NUMERIC,
  STANCE_ORDER,
  PARTY_BADGE_COLORS,
  getStanceDisplay,
} from '@/lib/utils/stances'

describe('stanceStyle', () => {
  it('returns correct style for known stances', () => {
    expect(stanceStyle('supports').label).toBe('Favors')
    expect(stanceStyle('opposes').label).toBe('Opposes')
    expect(stanceStyle('strongly_supports').label).toBe('Strongly Favors')
    expect(stanceStyle('neutral').label).toBe('Undecided')
    expect(stanceStyle('mixed').label).toBe('Mixed Views')
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
  it('maps support stances to Favors', () => {
    expect(getStanceDisplay('supports').label).toBe('Favors')
    expect(getStanceDisplay('strongly_supports').label).toBe('Favors')
  })

  it('maps oppose stances to Opposes', () => {
    expect(getStanceDisplay('opposes').label).toBe('Opposes')
    expect(getStanceDisplay('strongly_opposes').label).toBe('Opposes')
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

describe('stanceDisplayBadge', () => {
  it('returns slate fallback for supports without party', () => {
    const badge = stanceDisplayBadge('supports')
    expect(badge.label).toBe('Favors')
    expect(badge.className).toContain('slate')
    expect(badge.color).toBe('#334155')
  })

  it('returns slate fallback for opposes without party', () => {
    const badge = stanceDisplayBadge('opposes')
    expect(badge.label).toBe('Opposes')
    expect(badge.className).toContain('slate')
  })

  it('returns gray for mixed regardless of party', () => {
    const badge = stanceDisplayBadge('mixed', 'democrat')
    expect(badge.label).toBe('Mixed')
    expect(badge.className).toContain('gray')
  })

  it('returns gray for unknown regardless of party', () => {
    const badge = stanceDisplayBadge('unknown', 'republican')
    expect(badge.label).toBe('Unknown')
    expect(badge.className).toContain('gray')
  })

  it('uses blue classes for democrat supports', () => {
    const badge = stanceDisplayBadge('supports', 'democrat')
    expect(badge.label).toBe('Favors')
    expect(badge.className).toContain('blue')
    expect(badge.color).toBe('#1D4ED8')
  })

  it('uses blue classes for democrat opposes (same party color)', () => {
    const badge = stanceDisplayBadge('opposes', 'democrat')
    expect(badge.label).toBe('Opposes')
    expect(badge.className).toContain('blue')
    expect(badge.color).toBe('#1D4ED8')
  })

  it('uses red classes for republican supports', () => {
    const badge = stanceDisplayBadge('supports', 'republican')
    expect(badge.label).toBe('Favors')
    expect(badge.className).toContain('red')
    expect(badge.color).toBe('#B91C1C')
  })

  it('uses purple classes for independent', () => {
    const badge = stanceDisplayBadge('supports', 'independent')
    expect(badge.label).toBe('Favors')
    expect(badge.className).toContain('purple')
    expect(badge.color).toBe('#6D28D9')
  })

  it('uses green classes for green party', () => {
    const badge = stanceDisplayBadge('opposes', 'green')
    expect(badge.label).toBe('Opposes')
    expect(badge.className).toContain('green')
    expect(badge.color).toBe('#15803D')
  })

  it('falls back to independent for unknown party', () => {
    const badge = stanceDisplayBadge('supports', 'libertarian')
    expect(badge.className).toContain('purple')
    expect(badge.color).toBe('#6D28D9')
  })

  it('handles intensity stances correctly', () => {
    expect(stanceDisplayBadge('strongly_supports', 'democrat').label).toBe('Favors')
    expect(stanceDisplayBadge('leans_support', 'republican').label).toBe('Favors')
    expect(stanceDisplayBadge('strongly_opposes', 'democrat').label).toBe('Opposes')
    expect(stanceDisplayBadge('leans_oppose', 'republican').label).toBe('Opposes')
  })
})

describe('PARTY_BADGE_COLORS', () => {
  it('has entries for all four parties', () => {
    expect(PARTY_BADGE_COLORS.democrat).toBeDefined()
    expect(PARTY_BADGE_COLORS.republican).toBeDefined()
    expect(PARTY_BADGE_COLORS.independent).toBeDefined()
    expect(PARTY_BADGE_COLORS.green).toBeDefined()
  })

  it('each entry has className and color', () => {
    for (const key of Object.keys(PARTY_BADGE_COLORS)) {
      expect(PARTY_BADGE_COLORS[key].className).toBeTruthy()
      expect(PARTY_BADGE_COLORS[key].color).toMatch(/^#/)
    }
  })
})
