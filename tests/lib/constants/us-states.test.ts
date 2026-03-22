import { describe, it, expect } from 'vitest'
import { US_STATES, STATE_NAMES } from '@/lib/constants/us-states'

describe('US_STATES', () => {
  it('has 51 entries (50 states + DC)', () => {
    expect(US_STATES).toHaveLength(51)
  })

  it('includes all well-known states', () => {
    expect(US_STATES).toContain('CA')
    expect(US_STATES).toContain('NY')
    expect(US_STATES).toContain('TX')
    expect(US_STATES).toContain('FL')
    expect(US_STATES).toContain('DC')
  })

  it('all entries are 2-letter abbreviations', () => {
    for (const state of US_STATES) {
      expect(state).toMatch(/^[A-Z]{2}$/)
    }
  })

  it('has no duplicates', () => {
    expect(new Set(US_STATES).size).toBe(US_STATES.length)
  })
})

describe('STATE_NAMES', () => {
  it('has a name for every state abbreviation', () => {
    for (const abbr of US_STATES) {
      expect(STATE_NAMES[abbr], `Missing name for ${abbr}`).toBeTruthy()
    }
  })

  it('maps common abbreviations correctly', () => {
    expect(STATE_NAMES.CA).toBe('California')
    expect(STATE_NAMES.NY).toBe('New York')
    expect(STATE_NAMES.TX).toBe('Texas')
    expect(STATE_NAMES.DC).toBe('District of Columbia')
  })

  it('all names are non-empty strings', () => {
    for (const [abbr, name] of Object.entries(STATE_NAMES)) {
      expect(name.length, `Empty name for ${abbr}`).toBeGreaterThan(0)
    }
  })
})
