import { QUIZ_CONTENT } from '@/lib/data/quiz-content'

/** Number of issues the quiz actually asks about. Derived, never hardcoded. */
export const QUIZ_ISSUE_COUNT = Object.keys(QUIZ_CONTENT).length

export interface EngagementStats {
  pollVotes: number
  quizComplete: boolean
  quizIssuesAnswered: number
  billsFollowed: number
  politiciansFollowed: number
  currentStreak: number
  longestStreak: number
  totalEvents: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  check: (stats: EngagementStats) => boolean
}

export const BADGES: Badge[] = [
  {
    id: 'first_vote',
    name: 'First Vote',
    description: 'Voted in your first poll',
    icon: 'first_vote',
    requirement: 'Vote in 1 poll',
    check: (s) => s.pollVotes >= 1,
  },
  {
    id: 'informed_voter',
    name: 'Informed Voter',
    description: 'Completed the alignment quiz',
    icon: 'informed_voter',
    requirement: 'Complete the quiz',
    check: (s) => s.quizComplete,
  },
  {
    id: 'issue_expert',
    name: 'Issue Expert',
    description: `Answered all ${QUIZ_ISSUE_COUNT} quiz questions`,
    icon: 'issue_expert',
    requirement: `Answer all ${QUIZ_ISSUE_COUNT} quiz issues`,
    // Derived from the quiz itself. Hardcoding 14 meant the badge unlocked at
    // 14 of 22 while still claiming the user had answered "all" of them.
    check: (s) => s.quizIssuesAnswered >= QUIZ_ISSUE_COUNT,
  },
  {
    id: 'bill_watcher',
    name: 'Bill Watcher',
    description: 'Following 5 or more bills',
    icon: 'bill_watcher',
    requirement: 'Follow 5+ bills',
    check: (s) => s.billsFollowed >= 5,
  },
  {
    id: 'civic_regular',
    name: 'Civic Regular',
    description: '7-day engagement streak',
    icon: 'civic_regular',
    requirement: '7-day streak',
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: 'civic_champion',
    name: 'Civic Champion',
    description: '30-day engagement streak',
    icon: 'civic_champion',
    requirement: '30-day streak',
    check: (s) => s.currentStreak >= 30,
  },
  {
    id: 'networker',
    name: 'Networker',
    description: 'Following 10 or more politicians',
    icon: 'networker',
    requirement: 'Follow 10+ politicians',
    check: (s) => s.politiciansFollowed >= 10,
  },
  {
    id: 'dedicated',
    name: 'Dedicated Citizen',
    description: '50 or more total engagement events',
    icon: 'dedicated',
    requirement: '50+ engagement events',
    check: (s) => s.totalEvents >= 50,
  },
]

/**
 * Returns an array of newly earned badge IDs (not already in existingBadges).
 */
export function checkBadges(
  stats: EngagementStats,
  existingBadges: string[]
): string[] {
  const existing = new Set(existingBadges)
  return BADGES
    .filter((badge) => !existing.has(badge.id) && badge.check(stats))
    .map((badge) => badge.id)
}
