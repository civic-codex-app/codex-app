import { describe, it, expect } from 'vitest'
import {
  raceGroup,
  FEDERAL_CHAMBERS,
  STATE_CHAMBERS,
  LOCAL_CHAMBERS,
} from '@/lib/utils/fetch-ballot'

describe('raceGroup', () => {
  it('classifies federal chambers', () => {
    expect(raceGroup('senate')).toBe('Federal')
    expect(raceGroup('house')).toBe('Federal')
    expect(raceGroup('presidential')).toBe('Federal')
  })

  it('classifies state chambers', () => {
    expect(raceGroup('governor')).toBe('State')
    expect(raceGroup('state_senate')).toBe('State')
    expect(raceGroup('state_house')).toBe('State')
  })

  it('classifies local chambers', () => {
    expect(raceGroup('mayor')).toBe('Local')
    expect(raceGroup('city_council')).toBe('Local')
    expect(raceGroup('county')).toBe('Local')
    expect(raceGroup('school_board')).toBe('Local')
    expect(raceGroup('other_local')).toBe('Local')
  })

  it('defaults unknown chambers to Local', () => {
    expect(raceGroup('something_new')).toBe('Local')
  })
})

describe('chamber constants', () => {
  it('FEDERAL_CHAMBERS has expected values', () => {
    expect(FEDERAL_CHAMBERS).toEqual(['senate', 'house', 'presidential'])
  })

  it('STATE_CHAMBERS has expected values', () => {
    expect(STATE_CHAMBERS).toEqual(['governor', 'state_senate', 'state_house'])
  })

  it('LOCAL_CHAMBERS has expected values', () => {
    expect(LOCAL_CHAMBERS).toContain('mayor')
    expect(LOCAL_CHAMBERS).toContain('school_board')
  })

  it('no overlap between groups', () => {
    const all = [...FEDERAL_CHAMBERS, ...STATE_CHAMBERS, ...LOCAL_CHAMBERS]
    expect(new Set(all).size).toBe(all.length)
  })
})
