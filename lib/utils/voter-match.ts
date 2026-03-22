/**
 * Voter Match scoring utility.
 *
 * Computes how closely a user's issue stances align with a politician's
 * recorded stances using the same distance-decay curve as party alignment.
 */

import { STANCE_NUMERIC } from './stances'

export interface VoterMatchResult {
  politicianId: string
  score: number // 0-100
  matchedIssues: number
  totalIssues: number
}

/**
 * Compute a 0-100 match score between user stances and politician stances.
 *
 * Distance-decay weights (same as computeAlignment):
 *   0 distance = 1.0
 *   1 step     = 0.85
 *   2 steps    = 0.55
 *   3 steps    = 0.25
 *   4+ steps   = 0.0
 *
 * Only counts issues where BOTH sides have a valid numeric stance
 * (not unknown, not null, not missing).
 */
export function computeVoterMatch(
  userStances: Record<string, string>,
  politicianStances: Record<string, string>
): { score: number; matched: number; total: number } {
  let total = 0
  let weighted = 0

  for (const slug of Object.keys(userStances)) {
    const userVal = STANCE_NUMERIC[userStances[slug]]
    const polVal = STANCE_NUMERIC[politicianStances[slug]]

    // Skip if either side is missing or unknown (-1)
    if (userVal == null || polVal == null || userVal < 0 || polVal < 0) continue

    total++
    const distance = Math.abs(userVal - polVal)

    if (distance === 0) weighted += 1.0
    else if (distance === 1) weighted += 0.85
    else if (distance === 2) weighted += 0.55
    else if (distance === 3) weighted += 0.25
    // 4+ = 0
  }

  if (total === 0) return { score: 0, matched: 0, total: 0 }

  return {
    score: Math.round((weighted / total) * 100),
    matched: total,
    total: Object.keys(userStances).length,
  }
}
