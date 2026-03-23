import { describe, it, expect } from 'vitest'
import { computeAlignment, getPartyDefault, alignmentMeta } from '@/lib/utils/alignment'

describe('computeAlignment', () => {
  it('returns 100 for perfect party-line stances', () => {
    // Democrat who matches all defaults exactly
    const stances = [
      { stance: 'supports', issues: { slug: 'economy-and-jobs' } },
      { stance: 'strongly_supports', issues: { slug: 'healthcare-and-medicare' } },
      { stance: 'strongly_supports', issues: { slug: 'education-and-student-debt' } },
    ]
    const score = computeAlignment('democrat', stances)
    expect(score).toBe(100)
  })

  it('returns lower score when deviating from party line', () => {
    const stances = [
      { stance: 'strongly_opposes', issues: { slug: 'healthcare-and-medicare' } }, // default: strongly_supports (6 steps away!)
    ]
    const score = computeAlignment('democrat', stances)
    expect(score).toBe(0) // max distance
  })

  it('returns -1 for empty stances', () => {
    expect(computeAlignment('democrat', [])).toBe(-1)
  })

  it('returns -1 for unknown party', () => {
    const stances = [{ stance: 'supports', issues: { slug: 'economy-and-jobs' } }]
    expect(computeAlignment('libertarian', stances)).toBe(-1)
  })

  it('handles stances without issue slug', () => {
    const stances = [
      { stance: 'supports', issues: null },
      { stance: 'supports', issues: { slug: 'economy-and-jobs' } },
    ]
    const score = computeAlignment('democrat', stances)
    // Only the one with slug should be counted
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('works for republicans', () => {
    const stances = [
      { stance: 'strongly_supports', issues: { slug: 'immigration-and-border-security' } },
      { stance: 'strongly_supports', issues: { slug: 'national-defense-and-military' } },
    ]
    const score = computeAlignment('republican', stances)
    expect(score).toBe(100)
  })

  it('gives partial credit for 1-step deviation', () => {
    // Democrat default for economy = 'supports' (5)
    // Giving 'strongly_supports' (6) = 1 step = 0.85
    const stances = [{ stance: 'strongly_supports', issues: { slug: 'economy-and-jobs' } }]
    const score = computeAlignment('democrat', stances)
    expect(score).toBe(85)
  })

  it('skips neutral stances — no penalty', () => {
    const stances = [
      { stance: 'supports', issues: { slug: 'economy-and-jobs' } },           // matches dem default
      { stance: 'neutral', issues: { slug: 'healthcare-and-medicare' } },      // should be skipped
    ]
    const score = computeAlignment('democrat', stances)
    // Only economy counted, perfect match
    expect(score).toBe(100)
  })

  it('skips mixed stances', () => {
    const stances = [
      { stance: 'strongly_supports', issues: { slug: 'immigration-and-border-security' } }, // rep default
      { stance: 'mixed', issues: { slug: 'economy-and-jobs' } },
    ]
    const score = computeAlignment('republican', stances)
    expect(score).toBe(100)
  })

  it('returns -1 when all stances are neutral', () => {
    const stances = [
      { stance: 'neutral', issues: { slug: 'economy-and-jobs' } },
      { stance: 'neutral', issues: { slug: 'healthcare-and-medicare' } },
    ]
    expect(computeAlignment('democrat', stances)).toBe(-1)
  })
})

describe('getPartyDefault — new issues', () => {
  const NEW_ISSUES = [
    'reproductive-rights', 'lgbtq-rights', 'drug-policy', 'voting-rights',
    'taxes-and-spending', 'labor-and-unions', 'privacy-and-surveillance', 'trade-and-tariffs',
  ]

  it('has party defaults for all new issues', () => {
    for (const slug of NEW_ISSUES) {
      expect(getPartyDefault('democrat', slug), `democrat missing ${slug}`).toBeTruthy()
      expect(getPartyDefault('republican', slug), `republican missing ${slug}`).toBeTruthy()
      expect(getPartyDefault('independent', slug), `independent missing ${slug}`).not.toBeNull()
    }
  })
})

describe('getPartyDefault', () => {
  it('returns correct defaults for democrats', () => {
    expect(getPartyDefault('democrat', 'climate-and-environment')).toBe('strongly_supports')
    expect(getPartyDefault('democrat', 'energy-policy-and-oil-gas')).toBe('leans_oppose')
  })

  it('returns correct defaults for republicans', () => {
    expect(getPartyDefault('republican', 'climate-and-environment')).toBe('strongly_opposes')
    expect(getPartyDefault('republican', 'gun-policy-and-2nd-amendment')).toBe('strongly_opposes')
  })

  it('returns null for unknown issues', () => {
    expect(getPartyDefault('democrat', 'nonexistent-issue')).toBeNull()
  })

  it('returns null for unknown parties', () => {
    expect(getPartyDefault('libertarian', 'economy-and-jobs')).toBeNull()
  })

  it('is case-insensitive on party', () => {
    expect(getPartyDefault('Democrat', 'economy-and-jobs')).toBe('supports')
    expect(getPartyDefault('REPUBLICAN', 'economy-and-jobs')).toBe('supports')
  })
})

describe('alignmentMeta', () => {
  it('returns Strong Party Line for high scores', () => {
    expect(alignmentMeta(90).label).toBe('Strong Party Line')
    expect(alignmentMeta(85).label).toBe('Strong Party Line')
  })

  it('returns Mostly Aligned for mid-high scores', () => {
    expect(alignmentMeta(70).label).toBe('Mostly Aligned')
  })

  it('returns Moderate for middle scores', () => {
    expect(alignmentMeta(50).label).toBe('Moderate')
  })

  it('returns Independent Streak for low-mid scores', () => {
    expect(alignmentMeta(30).label).toBe('Independent Streak')
  })

  it('returns Maverick for very low scores', () => {
    expect(alignmentMeta(10).label).toBe('Maverick')
    expect(alignmentMeta(0).label).toBe('Maverick')
  })

  it('always returns color and bgColor', () => {
    for (const score of [0, 25, 45, 65, 85, 100]) {
      const meta = alignmentMeta(score)
      expect(meta.color).toMatch(/^#/)
      expect(meta.bgColor).toMatch(/^#/)
    }
  })
})
