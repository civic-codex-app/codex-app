import { describe, it, expect } from 'vitest'
import { BADGES, checkBadges, type EngagementStats } from '@/lib/constants/badges'

const emptyStats: EngagementStats = {
  pollVotes: 0,
  quizComplete: false,
  quizIssuesAnswered: 0,
  billsFollowed: 0,
  politiciansFollowed: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalEvents: 0,
}

describe('BADGES', () => {
  it('has 8 badges', () => {
    expect(BADGES).toHaveLength(8)
  })

  it('each badge has required fields', () => {
    for (const badge of BADGES) {
      expect(badge.id).toBeTruthy()
      expect(badge.name).toBeTruthy()
      expect(badge.description).toBeTruthy()
      expect(badge.icon).toBeTruthy()
      expect(badge.requirement).toBeTruthy()
      expect(typeof badge.check).toBe('function')
    }
  })

  it('has unique IDs', () => {
    const ids = BADGES.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('individual badge checks', () => {
  it('first_vote requires pollVotes >= 1', () => {
    const badge = BADGES.find(b => b.id === 'first_vote')!
    expect(badge.check(emptyStats)).toBe(false)
    expect(badge.check({ ...emptyStats, pollVotes: 1 })).toBe(true)
    expect(badge.check({ ...emptyStats, pollVotes: 5 })).toBe(true)
  })

  it('informed_voter requires quizComplete', () => {
    const badge = BADGES.find(b => b.id === 'informed_voter')!
    expect(badge.check(emptyStats)).toBe(false)
    expect(badge.check({ ...emptyStats, quizComplete: true })).toBe(true)
  })

  it('issue_expert requires 14 quiz issues answered', () => {
    const badge = BADGES.find(b => b.id === 'issue_expert')!
    expect(badge.check({ ...emptyStats, quizIssuesAnswered: 13 })).toBe(false)
    expect(badge.check({ ...emptyStats, quizIssuesAnswered: 14 })).toBe(true)
  })

  it('bill_watcher requires 5 bills followed', () => {
    const badge = BADGES.find(b => b.id === 'bill_watcher')!
    expect(badge.check({ ...emptyStats, billsFollowed: 4 })).toBe(false)
    expect(badge.check({ ...emptyStats, billsFollowed: 5 })).toBe(true)
  })

  it('civic_regular requires 7-day streak', () => {
    const badge = BADGES.find(b => b.id === 'civic_regular')!
    expect(badge.check({ ...emptyStats, currentStreak: 6 })).toBe(false)
    expect(badge.check({ ...emptyStats, currentStreak: 7 })).toBe(true)
  })

  it('civic_champion requires 30-day streak', () => {
    const badge = BADGES.find(b => b.id === 'civic_champion')!
    expect(badge.check({ ...emptyStats, currentStreak: 29 })).toBe(false)
    expect(badge.check({ ...emptyStats, currentStreak: 30 })).toBe(true)
  })

  it('networker requires 10 politicians followed', () => {
    const badge = BADGES.find(b => b.id === 'networker')!
    expect(badge.check({ ...emptyStats, politiciansFollowed: 9 })).toBe(false)
    expect(badge.check({ ...emptyStats, politiciansFollowed: 10 })).toBe(true)
  })

  it('dedicated requires 50 total events', () => {
    const badge = BADGES.find(b => b.id === 'dedicated')!
    expect(badge.check({ ...emptyStats, totalEvents: 49 })).toBe(false)
    expect(badge.check({ ...emptyStats, totalEvents: 50 })).toBe(true)
  })
})

describe('checkBadges', () => {
  it('returns empty array when no badges earned', () => {
    expect(checkBadges(emptyStats, [])).toEqual([])
  })

  it('returns newly earned badges', () => {
    const stats: EngagementStats = {
      ...emptyStats,
      pollVotes: 1,
      quizComplete: true,
    }
    const newBadges = checkBadges(stats, [])
    expect(newBadges).toContain('first_vote')
    expect(newBadges).toContain('informed_voter')
    expect(newBadges).not.toContain('bill_watcher')
  })

  it('excludes already-earned badges', () => {
    const stats: EngagementStats = {
      ...emptyStats,
      pollVotes: 1,
      quizComplete: true,
    }
    const newBadges = checkBadges(stats, ['first_vote'])
    expect(newBadges).not.toContain('first_vote')
    expect(newBadges).toContain('informed_voter')
  })

  it('returns empty when all earned badges already exist', () => {
    const stats: EngagementStats = {
      ...emptyStats,
      pollVotes: 1,
    }
    expect(checkBadges(stats, ['first_vote'])).toEqual([])
  })

  it('can earn all badges at once', () => {
    const maxStats: EngagementStats = {
      pollVotes: 10,
      quizComplete: true,
      quizIssuesAnswered: 14,
      billsFollowed: 10,
      politiciansFollowed: 20,
      currentStreak: 30,
      longestStreak: 30,
      totalEvents: 100,
    }
    const newBadges = checkBadges(maxStats, [])
    expect(newBadges).toHaveLength(8)
  })
})
