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
  strongly_supports: { bg: 'bg-blue-600/15',    text: 'text-blue-400',    label: 'Strongly For',   color: '#1D4ED8', shortLabel: 'Strongly For' },
  supports:          { bg: 'bg-blue-500/10',     text: 'text-blue-400',    label: 'For',            color: '#3B82F6', shortLabel: 'For' },
  leans_support:     { bg: 'bg-blue-400/10',     text: 'text-blue-300',    label: 'Leans For',      color: '#60A5FA', shortLabel: 'Leans For' },
  neutral:           { bg: 'bg-gray-500/10',     text: 'text-gray-400',    label: 'Undecided',      color: '#9CA3AF', shortLabel: 'Undecided' },
  mixed:             { bg: 'bg-purple-500/10',   text: 'text-purple-400',  label: 'Mixed Views',    color: '#A855F7', shortLabel: 'Mixed' },
  leans_oppose:      { bg: 'bg-red-400/10',      text: 'text-red-300',     label: 'Leans Against',  color: '#F87171', shortLabel: 'Leans Against' },
  opposes:           { bg: 'bg-red-500/10',      text: 'text-red-400',     label: 'Against',        color: '#EF4444', shortLabel: 'Against' },
  strongly_opposes:  { bg: 'bg-red-600/15',      text: 'text-red-400',     label: 'Strongly Against', color: '#DC2626', shortLabel: 'Strongly Against' },
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
 * Collapses 7-point scale into For / Mixed / Against / Unknown.
 */
export interface StanceDisplay {
  label: 'For' | 'Mixed' | 'Against' | 'Unknown'
  color: string
  bgColor: string
}

export function getStanceDisplay(stance: string): StanceDisplay {
  switch (stanceBucket(stance)) {
    case 'supports':
      return { label: 'For', color: '#3B82F6', bgColor: '#EFF6FF' }
    case 'opposes':
      return { label: 'Against', color: '#EF4444', bgColor: '#FEF2F2' }
    case 'neutral':
    case 'mixed':
      return { label: 'Mixed', color: '#A855F7', bgColor: '#FAF5FF' }
    default:
      return { label: 'Unknown', color: '#9CA3AF', bgColor: '#F3F4F6' }
  }
}

/**
 * 3-tier display badge for stance badges throughout the UI.
 * Returns a label + Tailwind className string for consistent badge rendering.
 *
 * Mapping:
 *   strongly_supports, supports, leans_support → "For" (green)
 *   neutral, mixed                             → "Mixed" (amber)
 *   leans_oppose, opposes, strongly_opposes     → "Against" (red)
 *   unknown / anything else                     → "Unknown" (gray)
 */
export interface StanceBadge {
  label: string
  className: string
  color: string // hex color for inline style usage
}

export function stanceDisplayBadge(stance: string): StanceBadge {
  const bucket = stanceBucket(stance)
  switch (bucket) {
    case 'supports':
      return { label: 'For', className: 'text-emerald-700 bg-emerald-50 border border-emerald-200', color: '#047857' }
    case 'opposes':
      return { label: 'Against', className: 'text-red-700 bg-red-50 border border-red-200', color: '#B91C1C' }
    case 'neutral':
    case 'mixed':
      return { label: 'Mixed', className: 'text-amber-700 bg-amber-50 border border-amber-200', color: '#B45309' }
    default:
      return { label: 'Unknown', className: 'text-gray-500 bg-gray-50 border border-gray-200', color: '#6B7280' }
  }
}
