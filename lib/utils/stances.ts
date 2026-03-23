/**
 * Shared stance type definitions, colors, labels, and numeric mappings.
 *
 * 7-point intensity scale:
 *   strongly_supports → supports → leans_support → neutral → leans_oppose → opposes → strongly_opposes
 *
 * Plus: mixed, unknown (legacy / catch-all)
 */

export type StanceType =
  | 'strongly_supports'
  | 'supports'
  | 'leans_support'
  | 'neutral'
  | 'leans_oppose'
  | 'opposes'
  | 'strongly_opposes'
  | 'mixed'
  | 'unknown'

export interface StanceStyle {
  bg: string       // Tailwind bg class (with opacity)
  text: string     // Tailwind text color class
  label: string    // Human-readable label
  color: string    // Hex color for SVG / inline styles
  shortLabel: string // Compact label for tight spaces
}

/** Full stance style config for every stance type
 *  Uses a blue↔red political spectrum — how blue or red is this position?
 *  No good/bad judgment, just where on the spectrum it falls.
 */
export const STANCE_STYLES: Record<string, StanceStyle> = {
  strongly_supports: { bg: 'bg-blue-600/15',    text: 'text-blue-400',    label: 'Strongly Favors',   color: '#1D4ED8', shortLabel: 'Favors' },
  supports:          { bg: 'bg-blue-500/10',     text: 'text-blue-400',    label: 'Favors',            color: '#3B82F6', shortLabel: 'Favors' },
  leans_support:     { bg: 'bg-blue-400/10',     text: 'text-blue-300',    label: 'Leans Toward',      color: '#60A5FA', shortLabel: 'Favors' },
  neutral:           { bg: 'bg-gray-500/10',     text: 'text-gray-400',    label: 'Undecided',      color: '#9CA3AF', shortLabel: 'Undecided' },
  mixed:             { bg: 'bg-purple-500/10',   text: 'text-purple-400',  label: 'Mixed Views',    color: '#A855F7', shortLabel: 'Mixed' },
  leans_oppose:      { bg: 'bg-red-400/10',      text: 'text-red-300',     label: 'Leans Against',  color: '#F87171', shortLabel: 'Opposes' },
  opposes:           { bg: 'bg-red-500/10',      text: 'text-red-400',     label: 'Opposes',        color: '#EF4444', shortLabel: 'Opposes' },
  strongly_opposes:  { bg: 'bg-red-600/15',      text: 'text-red-400',     label: 'Strongly Opposes', color: '#DC2626', shortLabel: 'Opposes' },
  unknown:           { bg: 'bg-[var(--codex-badge-bg)]', text: 'text-[var(--codex-faint)]', label: 'Unknown', color: '#6B7280', shortLabel: 'Unknown' },
}

/** Get style for any stance string (safe fallback to unknown) */
export function stanceStyle(stance: string): StanceStyle {
  return STANCE_STYLES[stance] ?? STANCE_STYLES.unknown
}

/**
 * Numeric value for a stance on a 0–6 scale (for radar charts, etc.)
 * 6 = strongly supports, 0 = strongly opposes
 */
export const STANCE_NUMERIC: Record<string, number> = {
  strongly_supports: 6,
  supports: 5,
  leans_support: 4,
  neutral: 3,
  mixed: 3,
  leans_oppose: 2,
  opposes: 1,
  strongly_opposes: 0,
  unknown: -1,
}

export const MAX_STANCE_VALUE = 6

/**
 * Canonical ordering for display (most supportive → most opposed → special)
 */
export const STANCE_ORDER: string[] = [
  'strongly_supports',
  'supports',
  'leans_support',
  'neutral',
  'mixed',
  'leans_oppose',
  'opposes',
  'strongly_opposes',
  'unknown',
]

/**
 * Classify a stance into a support/oppose/neutral bucket.
 * Useful for heatmaps and aggregate charts that don't need full granularity.
 */
export function stanceBucket(stance: string): 'supports' | 'opposes' | 'neutral' | 'mixed' | 'unknown' {
  switch (stance) {
    case 'strongly_supports':
    case 'supports':
    case 'leans_support':
      return 'supports'
    case 'strongly_opposes':
    case 'opposes':
    case 'leans_oppose':
      return 'opposes'
    case 'neutral':
      return 'neutral'
    case 'mixed':
      return 'mixed'
    default:
      return 'unknown'
  }
}

/**
 * Simplified 3-tier stance display for the redesigned UI.
 * Collapses 7-point scale into Favors / Mixed / Opposes / Unknown.
 */
export interface StanceDisplay {
  label: string
  color: string
  bgColor: string
}

export function getStanceDisplay(stance: string, party?: string): StanceDisplay {
  const bucket = stanceBucket(stance)

  // Mixed and unknown are always gray regardless of party
  if (bucket === 'neutral' || bucket === 'mixed') {
    return { label: 'Mixed', color: '#A855F7', bgColor: '#FAF5FF' }
  }
  if (bucket === 'unknown') {
    return { label: 'Unknown', color: '#9CA3AF', bgColor: '#F3F4F6' }
  }

  const label = bucket === 'supports' ? 'Favors' : 'Opposes'

  if (party) {
    const pc = PARTY_BADGE_COLORS[party.toLowerCase()] ?? PARTY_BADGE_COLORS.independent
    return { label, color: pc.color, bgColor: pc.color + '0D' }
  }

  // Fallback (no party)
  if (bucket === 'supports') {
    return { label, color: '#3B82F6', bgColor: '#EFF6FF' }
  }
  return { label, color: '#EF4444', bgColor: '#FEF2F2' }
}

/**
 * Party-aware badge colors for stance display.
 * When a party is provided, BOTH "Favors" and "Opposes" use the party color
 * so that badges visually communicate who holds the stance.
 */
export const PARTY_BADGE_COLORS: Record<string, { className: string; color: string }> = {
  democrat:    { className: 'text-blue-700 bg-blue-50 border border-blue-200', color: '#1D4ED8' },
  republican:  { className: 'text-red-700 bg-red-50 border border-red-200', color: '#B91C1C' },
  independent: { className: 'text-purple-700 bg-purple-50 border border-purple-200', color: '#6D28D9' },
  green:       { className: 'text-green-700 bg-green-50 border border-green-200', color: '#15803D' },
}

/**
 * 3-tier display badge for stance badges throughout the UI.
 * Returns a label + Tailwind className string for consistent badge rendering.
 *
 * When `party` is provided, uses the politician's party color for both
 * Favors and Opposes so badges visually identify party affiliation.
 *
 * Mapping:
 *   strongly_supports, supports, leans_support → "Favors"
 *   neutral, mixed                             → "Mixed" (gray)
 *   leans_oppose, opposes, strongly_opposes     → "Opposes"
 *   unknown / anything else                     → "Unknown" (gray)
 */
export interface StanceBadge {
  label: string
  className: string
  color: string // hex color for inline style usage
  style: { color: string; backgroundColor: string; borderColor: string }
}

export function stanceDisplayBadge(stance: string, _party?: string): StanceBadge {
  const bucket = stanceBucket(stance)

  // Favors = blue, Opposes = red, Mixed = gray — always
  // Uses inline styles to avoid Tailwind purging issues
  if (bucket === 'supports') {
    return { label: 'Favors', className: '', color: '#1D4ED8', style: { color: '#1E40AF', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' } }
  }
  if (bucket === 'opposes') {
    return { label: 'Opposes', className: '', color: '#B91C1C', style: { color: '#B91C1C', backgroundColor: '#FEF2F2', borderColor: '#FECACA' } }
  }
  if (bucket === 'neutral' || bucket === 'mixed') {
    return { label: 'Mixed', className: '', color: '#4B5563', style: { color: '#4B5563', backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' } }
  }
  return { label: 'Unknown', className: '', color: '#6B7280', style: { color: '#6B7280', backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' } }
}
