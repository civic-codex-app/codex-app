/**
 * Voter Match scoring utility.
 *
 * Three weighting factors:
 * 1. CONVICTION — how strongly the USER feels (strongly = 3x, regular = 2x, lean = 1x, neutral = 0.5x)
 *    Issues you care about deeply count more than ones you barely have an opinion on.
 * 2. SIMILARITY — how close the politician's stance is to yours (distance-decay curve)
 * 3. VERIFICATION — verified stances count more than estimated party defaults (1.0x vs 0.5x)
 *
 * Final score = sum(conviction * similarity * verification) / sum(conviction * verification) * 100
 */

import { STANCE_NUMERIC } from './stances'

export interface VoterMatchResult {
  politicianId: string
  score: number // 0-100
  matchedIssues: number
  totalIssues: number
}

/** How much the user's conviction level weights each issue */
const CONVICTION_WEIGHT: Record<string, number> = {
  strongly_supports: 3.0,
  strongly_opposes: 3.0,
  supports: 2.0,
  opposes: 2.0,
  leans_support: 1.0,
  leans_oppose: 1.0,
  neutral: 0.5,
  mixed: 0.5,
}

/** Weight multiplier for verified vs estimated stances */
const VERIFIED_WEIGHT = 1.0
const ESTIMATED_WEIGHT = 0.5

/**
 * Compute a 0-100 score between user stances and politician stances.
 *
 * Distance-decay similarity:
 *   0 distance = 1.0 (exact same position)
 *   1 step     = 0.85
 *   2 steps    = 0.55
 *   3 steps    = 0.25
 *   4+ steps   = 0.0 (opposite ends)
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
    const userStance = userStances[slug]
    const userVal = STANCE_NUMERIC[userStance]
    const polVal = STANCE_NUMERIC[politicianStances[slug]]

    // Skip if either side is missing or unknown (-1)
    if (userVal == null || polVal == null || userVal < 0 || polVal < 0) continue

    // Neutral/mixed = no opinion — skip so it doesn't penalize the score
    if (userStance === 'neutral' || userStance === 'mixed') continue

    matched++
    const distance = Math.abs(userVal - polVal)

    let similarity = 0
    if (distance === 0) similarity = 1.0
    else if (distance === 1) similarity = 0.85
    else if (distance === 2) similarity = 0.55
    else if (distance === 3) similarity = 0.25
    // 4+ = 0

    // Conviction weight — how strongly the user feels about this issue
    const conviction = CONVICTION_WEIGHT[userStance] ?? 1.0

    // Verification weight — verified positions count more
    const isVerified = verifiedMap ? (verifiedMap[slug] ?? false) : true
    const verification = isVerified ? VERIFIED_WEIGHT : ESTIMATED_WEIGHT

    const issueWeight = conviction * verification
    weighted += similarity * issueWeight
    totalWeight += issueWeight
  }

  if (matched === 0 || totalWeight === 0) return { score: 0, matched: 0, total: 0 }

  return {
    score: Math.round((weighted / totalWeight) * 100),
    matched,
    total: Object.keys(userStances).length,
  }
}
