/**
 * Politician Report Card scoring utility.
 *
 * Computes a letter grade (A–F) based on four equally weighted dimensions:
 *   Bipartisanship, Engagement, Transparency, Effectiveness
 */

import { computeAlignment } from './alignment'
import { type StanceRecord } from './alignment'

export interface ReportCardInput {
  party: string
  chamber?: string
  stances: StanceRecord[]
  votingRecords: Array<{ vote: string }>
  committees: Array<{ role: string }>
  verifiedStances: number // count of is_verified=true
  totalStances: number
}

export interface ReportCard {
  grade: string // A, B, C, D, F
  score: number // 0-100
  bipartisanship: number // 0-100
  engagement: number // 0-100
  transparency: number // 0-100
  effectiveness: number // 0-100
}

/**
 * Compute a full report card for a politician.
 *
 * Each dimension is 0–100, final score is the average of all four,
 * and the letter grade is derived from that score.
 */
export function computeReportCard(input: ReportCardInput): ReportCard {
  const { party, chamber, stances, votingRecords, committees, verifiedStances, totalStances } = input

  // Executives (president, governor) don't vote on bills or sit on
  // congressional committees — only score them on dimensions that apply
  const isExecutive = ['presidential', 'governor'].includes(chamber ?? '')

  // --- Bipartisanship ---
  // Measures willingness to break from party. Moderate formula:
  // 100% alignment → 40 (loyal but not maverick)
  // 50% alignment → 100 (perfectly centrist)
  // 0% alignment → 40 (contrarian)
  const alignment = computeAlignment(party, stances)
  const bipartisanship =
    alignment < 0
      ? 60
      : Math.round(40 + 60 * (1 - Math.pow((alignment - 50) / 50, 2)))

  // --- Engagement ---
  // For legislators: proportion of yea/nay votes. For executives: skip (N/A)
  let engagement = isExecutive ? -1 : 60
  if (!isExecutive && votingRecords.length > 0) {
    const engaged = votingRecords.filter(
      (v) => v.vote === 'yea' || v.vote === 'nay'
    ).length
    engagement = Math.round((engaged / votingRecords.length) * 100)
  }

  // --- Transparency ---
  // Having stance positions at all shows transparency (even if unverified).
  // Verified stances get a bonus.
  let transparency = 30 // no stances at all
  if (totalStances > 0) {
    // Base: 50 for having stances, up to 80 for having many (14 = full coverage)
    const coverageScore = Math.min(totalStances / 14, 1) * 30 + 50
    // Bonus for verified stances
    const verifiedBonus = totalStances > 0 ? (verifiedStances / totalStances) * 20 : 0
    transparency = Math.round(Math.min(coverageScore + verifiedBonus, 100))
  }

  // --- Effectiveness ---
  // For executives: based on having stance positions defined. For legislators: committees.
  let effectiveness: number
  if (isExecutive) {
    // Executives get effectiveness from having clear stances on issues
    effectiveness = totalStances >= 10 ? 80 : totalStances >= 5 ? 65 : 50
  } else {
    effectiveness = 50
    if (committees.length > 0) {
      let base = Math.min(committees.length * 15, 60)
      let bonus = 0
      for (const c of committees) {
        const role = (c.role ?? '').toLowerCase()
        if (role === 'chair') bonus += 20
        else if (role === 'vice_chair') bonus += 15
        else if (role === 'ranking_member') bonus += 10
      }
      effectiveness = Math.min(base + bonus, 100)
    }
  }

  // Average only the applicable dimensions
  const dims = [bipartisanship, transparency, effectiveness]
  if (engagement >= 0) dims.push(engagement)
  const score = Math.round(dims.reduce((a, b) => a + b, 0) / dims.length)

  return {
    grade: gradeFromScore(score),
    score,
    bipartisanship,
    engagement,
    transparency,
    effectiveness,
  }
}

/** Map a 0–100 score to a letter grade. Generous curve to stay positive. */
export function gradeFromScore(score: number): string {
  if (score >= 75) return 'A'
  if (score >= 60) return 'B'
  if (score >= 45) return 'C'
  if (score >= 30) return 'D'
  return 'F'
}

/** Hex color for a letter grade. */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return '#22C55E'
    case 'B':
      return '#3B82F6'
    case 'C':
      return '#EAB308'
    case 'D':
      return '#F97316'
    default:
      return '#EF4444'
  }
}
