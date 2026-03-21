/**
 * Party alignment / agreeability utilities.
 *
 * Computes how closely a politician's recorded stances match
 * the baseline positions for their registered party.
 *
 * Now supports 7-point intensity scale:
 *   strongly_supports → supports → leans_support → neutral →
 *   leans_oppose → opposes → strongly_opposes
 */

import { STANCE_NUMERIC } from './stances'

// Canonical party-default stances keyed by issue slug.
// Values use the 7-point scale (or 'mixed' for genuinely split positions).
const PARTY_DEFAULTS: Record<string, Record<string, string>> = {
  democrat: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'strongly_supports',
    'immigration-and-border-security': 'leans_support',
    'education-and-student-debt': 'strongly_supports',
    'national-defense-and-military': 'supports',
    'climate-and-environment': 'strongly_supports',
    'criminal-justice-reform': 'strongly_supports',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'supports',
    'social-security-and-medicare': 'strongly_supports',
    'gun-policy-and-2nd-amendment': 'supports',
    'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'strongly_supports',
    'energy-policy-and-oil-gas': 'leans_oppose',
  },
  republican: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'opposes',
    'immigration-and-border-security': 'strongly_supports',
    'education-and-student-debt': 'opposes',
    'national-defense-and-military': 'strongly_supports',
    'climate-and-environment': 'strongly_opposes',
    'criminal-justice-reform': 'opposes',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'leans_oppose',
    'social-security-and-medicare': 'leans_support',
    'gun-policy-and-2nd-amendment': 'strongly_opposes',
    'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'leans_oppose',
    'energy-policy-and-oil-gas': 'strongly_supports',
  },
  independent: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'supports',
    'immigration-and-border-security': 'neutral',
    'education-and-student-debt': 'supports',
    'national-defense-and-military': 'neutral',
    'climate-and-environment': 'supports',
    'criminal-justice-reform': 'supports',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'supports',
    'social-security-and-medicare': 'supports',
    'gun-policy-and-2nd-amendment': 'leans_support',
    'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'supports',
    'energy-policy-and-oil-gas': 'neutral',
  },
}

export interface StanceRecord {
  stance: string
  issues?: { slug: string } | null
}

/**
 * Compute a 0–100 party alignment score using the 7-point intensity scale.
 *
 * Uses numeric distance between the politician's stance and the party default:
 *   - Exact match = 1.0
 *   - 1 step away = 0.85
 *   - 2 steps = 0.55
 *   - 3 steps = 0.25
 *   - 4+ steps = 0.0
 */
export function computeAlignment(
  party: string,
  stances: StanceRecord[]
): number {
  const defaults = PARTY_DEFAULTS[party.toLowerCase()]
  if (!defaults || stances.length === 0) return -1

  let total = 0
  let matched = 0

  for (const s of stances) {
    const slug = s.issues?.slug
    if (!slug || !defaults[slug]) continue

    const expectedVal = STANCE_NUMERIC[defaults[slug]]
    const actualVal = STANCE_NUMERIC[s.stance]
    if (expectedVal == null || actualVal == null || expectedVal < 0 || actualVal < 0) continue

    total++
    const distance = Math.abs(expectedVal - actualVal)

    if (distance === 0) matched += 1.0
    else if (distance === 1) matched += 0.85
    else if (distance === 2) matched += 0.55
    else if (distance === 3) matched += 0.25
    else matched += 0.0
  }

  if (total === 0) return -1
  return Math.round((matched / total) * 100)
}

/**
 * Get the party default stance for a given issue.
 */
export function getPartyDefault(party: string, issueSlug: string): string | null {
  return PARTY_DEFAULTS[party.toLowerCase()]?.[issueSlug] ?? null
}

/**
 * Label + color for an alignment score.
 */
export function alignmentMeta(score: number): {
  label: string
  color: string
  bgColor: string
} {
  if (score >= 85) return { label: 'Strong Party Line', color: '#22C55E', bgColor: '#22C55E18' }
  if (score >= 65) return { label: 'Mostly Aligned', color: '#3B82F6', bgColor: '#3B82F618' }
  if (score >= 45) return { label: 'Moderate', color: '#EAB308', bgColor: '#EAB30818' }
  if (score >= 25) return { label: 'Independent Streak', color: '#F97316', bgColor: '#F9731618' }
  return { label: 'Maverick', color: '#EF4444', bgColor: '#EF444418' }
}
