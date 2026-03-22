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
  const { party, stances, votingRecords, committees, verifiedStances, totalStances } = input

  // --- Bipartisanship (25%) ---
  // Politicians near 50% party alignment (centrist) score highest.
  const alignment = computeAlignment(party, stances)
  const bipartisanship =
    alignment < 0
      ? 50
      : Math.max(0, 100 - Math.abs(alignment - 50) * 2)

  // --- Engagement (25%) ---
  // Proportion of votes that are yea/nay (vs. absent/abstain/etc.)
  let engagement = 50
  if (votingRecords.length > 0) {
    const engaged = votingRecords.filter(
      (v) => v.vote === 'yea' || v.vote === 'nay'
    ).length
    engagement = Math.round((engaged / votingRecords.length) * 100)
  }

  // --- Transparency (25%) ---
  let transparency = 50
  if (totalStances > 0) {
    transparency = Math.round((verifiedStances / totalStances) * 100)
  }

  // --- Effectiveness (25%) ---
  let effectiveness = 30
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

  const score = Math.round(
    (bipartisanship + engagement + transparency + effectiveness) / 4
  )

  return {
    grade: gradeFromScore(score),
    score,
    bipartisanship,
    engagement,
    transparency,
    effectiveness,
  }
}

/** Map a 0–100 score to a letter grade. */
export function gradeFromScore(score: number): string {
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
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
