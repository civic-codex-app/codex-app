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
    icon: '\u{1F5F3}\uFE0F',
    requirement: 'Vote in 1 poll',
    check: (s) => s.pollVotes >= 1,
  },
  {
    id: 'informed_voter',
    name: 'Informed Voter',
    description: 'Completed the alignment quiz',
    icon: '\u{1F393}',
    requirement: 'Complete the quiz',
    check: (s) => s.quizComplete,
  },
  {
    id: 'issue_expert',
    name: 'Issue Expert',
    description: 'Answered all 14 quiz questions',
    icon: '\u{1F9E0}',
    requirement: 'Answer all 14 quiz issues',
    check: (s) => s.quizIssuesAnswered >= 14,
  },
  {
    id: 'bill_watcher',
    name: 'Bill Watcher',
    description: 'Following 5 or more bills',
    icon: '\u{1F4DC}',
    requirement: 'Follow 5+ bills',
    check: (s) => s.billsFollowed >= 5,
  },
  {
    id: 'civic_regular',
    name: 'Civic Regular',
    description: '7-day engagement streak',
    icon: '\u{1F525}',
    requirement: '7-day streak',
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: 'civic_champion',
    name: 'Civic Champion',
    description: '30-day engagement streak',
    icon: '\u{1F3C6}',
    requirement: '30-day streak',
    check: (s) => s.currentStreak >= 30,
  },
  {
    id: 'networker',
    name: 'Networker',
    description: 'Following 10 or more politicians',
    icon: '\u{1F91D}',
    requirement: 'Follow 10+ politicians',
    check: (s) => s.politiciansFollowed >= 10,
  },
  {
    id: 'dedicated',
    name: 'Dedicated Citizen',
    description: '50 or more total engagement events',
    icon: '\u2B50',
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
