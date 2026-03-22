import { describe, it, expect } from 'vitest'
import { CHAMBERS, CHAMBER_LABELS } from '@/lib/constants/chambers'

describe('CHAMBERS', () => {
  it('includes all expected chamber types', () => {
    expect(CHAMBERS).toContain('senate')
    expect(CHAMBERS).toContain('house')
    expect(CHAMBERS).toContain('governor')
    expect(CHAMBERS).toContain('presidential')
    expect(CHAMBERS).toContain('mayor')
    expect(CHAMBERS).toContain('city_council')
    expect(CHAMBERS).toContain('state_senate')
    expect(CHAMBERS).toContain('state_house')
    expect(CHAMBERS).toContain('county')
    expect(CHAMBERS).toContain('school_board')
    expect(CHAMBERS).toContain('other_local')
  })

  it('includes "all" for filter purposes', () => {
    expect(CHAMBERS).toContain('all')
  })
})

describe('CHAMBER_LABELS', () => {
  it('has a label for every chamber type', () => {
    for (const chamber of CHAMBERS) {
      expect(CHAMBER_LABELS[chamber]).toBeTruthy()
    }
  })

  it('returns readable labels', () => {
    expect(CHAMBER_LABELS.senate).toBe('Senate')
    expect(CHAMBER_LABELS.house).toBe('House')
    expect(CHAMBER_LABELS.governor).toBe('Statewide')
    expect(CHAMBER_LABELS.school_board).toBe('School Board')
  })
})
