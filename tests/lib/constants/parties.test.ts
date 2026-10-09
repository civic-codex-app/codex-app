import { describe, it, expect } from 'vitest'
import { partyColor, partyLabel, PARTIES } from '@/lib/constants/parties'

describe('partyColor', () => {
  it('returns correct colors for known parties', () => {
    expect(partyColor('democrat')).toBe('#2563EB')
    expect(partyColor('republican')).toBe('#DC2626')
    expect(partyColor('green')).toBe('#16A34A')
    expect(partyColor('independent')).toBe('#7C3AED')
  })

  it('is case-insensitive', () => {
    expect(partyColor('Democrat')).toBe('#2563EB')
    expect(partyColor('REPUBLICAN')).toBe('#DC2626')
  })

  it('gives every minor party its own colour, distinct from the four majors', () => {
    const majors = ['democrat', 'republican', 'green', 'independent'].map(partyColor)
    for (const p of ['libertarian', 'constitution', 'us_taxpayers', 'natural_law', 'working_class']) {
      expect(partyColor(p)).toBe(PARTIES[p as keyof typeof PARTIES].color)
      expect(majors).not.toContain(partyColor(p))
    }
  })

  it('falls back to independent color for unknown parties', () => {
    expect(partyColor('whig')).toBe(PARTIES.independent.color)
    expect(partyColor('')).toBe(PARTIES.independent.color)
  })
})

describe('partyLabel', () => {
  it('returns correct labels', () => {
    expect(partyLabel('democrat')).toBe('Democratic')
    expect(partyLabel('republican')).toBe('Republican')
    expect(partyLabel('green')).toBe('Green')
    expect(partyLabel('independent')).toBe('Independent')
  })

  it('names the minor parties as they appear on a ballot', () => {
    expect(partyLabel('libertarian')).toBe('Libertarian')
    expect(partyLabel('us_taxpayers')).toBe('U.S. Taxpayers')
    expect(partyLabel('working_class')).toBe('Working Class')
  })

  it('returns the raw string for unknown parties', () => {
    expect(partyLabel('whig')).toBe('whig')
  })
})
