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
 *  Uses a neutral blue↔orange spectrum to avoid green=good/red=bad bias.
 *  Labels use "For/Against" not "Supports/Opposes" to stay impartial.
 */
export const STANCE_STYLES: Record<string, StanceStyle> = {
  strongly_supports: { bg: 'bg-blue-600/15',    text: 'text-blue-400',    label: 'Strongly For',    color: '#2563EB', shortLabel: 'Strong For' },
  supports:          { bg: 'bg-blue-500/10',     text: 'text-blue-400',    label: 'For',             color: '#3B82F6', shortLabel: 'For' },
  leans_support:     { bg: 'bg-sky-500/10',      text: 'text-sky-400',     label: 'Leans For',       color: '#0EA5E9', shortLabel: 'Leans For' },
  neutral:           { bg: 'bg-gray-500/10',     text: 'text-gray-400',    label: 'Neutral',         color: '#9CA3AF', shortLabel: 'Neutral' },
  mixed:             { bg: 'bg-amber-500/10',    text: 'text-amber-400',   label: 'Mixed',           color: '#F59E0B', shortLabel: 'Mixed' },
  leans_oppose:      { bg: 'bg-orange-500/10',   text: 'text-orange-400',  label: 'Leans Against',   color: '#F97316', shortLabel: 'Leans Against' },
  opposes:           { bg: 'bg-orange-600/10',   text: 'text-orange-400',  label: 'Against',         color: '#EA580C', shortLabel: 'Against' },
  strongly_opposes:  { bg: 'bg-orange-700/15',   text: 'text-orange-300',  label: 'Strongly Against', color: '#C2410C', shortLabel: 'Strong Against' },
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
      return { label: 'For', color: '#10B981', bgColor: '#ECFDF5' }
    case 'opposes':
      return { label: 'Against', color: '#EF4444', bgColor: '#FEF2F2' }
    case 'neutral':
    case 'mixed':
      return { label: 'Mixed', color: '#F59E0B', bgColor: '#FFFBEB' }
    default:
      return { label: 'Unknown', color: '#9CA3AF', bgColor: '#F3F4F6' }
  }
}
