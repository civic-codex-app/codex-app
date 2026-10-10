import { describe, it, expect } from 'vitest'
import { raceLine, type BallotRace } from '@/components/home/ballot-card'

type C = BallotRace['candidates'][number]
const c = (name: string, party: string, extra: Partial<C> = {}): C => ({
  id: name,
  name,
  party,
  status: 'running',
  is_incumbent: false,
  image_url: null,
  politician_slug: null,
  ...extra,
})
const race = (confirmed: boolean, candidates: C[]): BallotRace => ({
  id: 'r',
  name: 'Michigan Senate',
  slug: 'mi-senate-2026',
  chamber: 'senate',
  district: null,
  confirmed,
  candidates,
})

describe('raceLine', () => {
  it('draws the matchup for a race reconciled against the state listing', () => {
    expect(raceLine(race(true, [c('Abdul El-Sayed', 'democrat'), c('Mike Rogers', 'republican'), c('Douglas Marsh', 'green')]))).toBe(
      'El-Sayed vs. Rogers and 1 other · open seat'
    )
  })

  it('counts the filers and names nobody before the state listing is reconciled', () => {
    // Two Democrats with status running is a primary nobody has resolved, not a race.
    expect(raceLine(race(false, [c('A Adams', 'democrat'), c('B Brown', 'democrat'), c('C Clark', 'republican')]))).toBe(
      '3 filed · nominees not confirmed'
    )
  })

  it('says so when no candidate is on record, confirmed or not', () => {
    expect(raceLine(race(true, []))).toBe('No candidates on record yet')
    expect(raceLine(race(false, [c('Gone', 'democrat', { status: 'lost' })]))).toBe('No candidates on record yet')
  })
})
