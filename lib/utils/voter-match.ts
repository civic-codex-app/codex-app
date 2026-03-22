/**
 * Voter Match scoring utility.
 *
 * Computes how closely a user's issue stances align with a politician's
 * recorded stances using the same distance-decay curve as party alignment.
 *
 * Verified stances get full weight (1.0x) while estimated/unverified
 * stances get reduced weight (0.5x) so politicians with real, verified
 * positions rank higher than those with generic party defaults.
 */

import { STANCE_NUMERIC } from './stances'

export interface VoterMatchResult {
  politicianId: string
  score: number // 0-100
  matchedIssues: number
  totalIssues: number
}

/** Weight multiplier for verified vs estimated stances */
const VERIFIED_WEIGHT = 1.0
const ESTIMATED_WEIGHT = 0.5

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
 *
 * @param userStances       Map of issue slug -> stance string
 * @param politicianStances Map of issue slug -> stance string
 * @param verifiedMap       Optional map of issue slug -> boolean (true = verified)
 */
export function computeVoterMatch(
  userStances: Record<string, string>,
  politicianStances: Record<string, string>,
  verifiedMap?: Record<string, boolean>
): { score: number; matched: number; total: number } {
  let totalWeight = 0
  let weighted = 0
  let matched = 0

  for (const slug of Object.keys(userStances)) {
    const userVal = STANCE_NUMERIC[userStances[slug]]
    const polVal = STANCE_NUMERIC[politicianStances[slug]]

    // Skip if either side is missing or unknown (-1)
    if (userVal == null || polVal == null || userVal < 0 || polVal < 0) continue

    matched++
    const distance = Math.abs(userVal - polVal)

    let similarity = 0
    if (distance === 0) similarity = 1.0
    else if (distance === 1) similarity = 0.85
    else if (distance === 2) similarity = 0.55
    else if (distance === 3) similarity = 0.25
    // 4+ = 0

    // Apply verification weight
    const isVerified = verifiedMap ? (verifiedMap[slug] ?? false) : true
    const weight = isVerified ? VERIFIED_WEIGHT : ESTIMATED_WEIGHT

    weighted += similarity * weight
    totalWeight += weight
  }

  if (matched === 0 || totalWeight === 0) return { score: 0, matched: 0, total: 0 }

  return {
    score: Math.round((weighted / totalWeight) * 100),
    matched,
    total: Object.keys(userStances).length,
  }
}
