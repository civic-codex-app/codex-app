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

  it('falls back to independent color for unknown parties', () => {
    expect(partyColor('libertarian')).toBe(PARTIES.independent.color)
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

  it('returns the raw string for unknown parties', () => {
    expect(partyLabel('libertarian')).toBe('libertarian')
  })
})
