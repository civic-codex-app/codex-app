import { STANCE_NUMERIC } from '@/lib/utils/stances'

/**
 * The quiet screens' stance vocabulary: a word, a dot and a lane.
 *
 * Three lanes — for, mixed, against — collapse the seven-point scale the way
 * a reader does, while the word keeps the intensity ("Leans against"). The
 * colours are the stance tokens from globals.css; the inks are the darker
 * text shades that pass contrast on the card colour in both themes.
 */
export const STANCE_WORD: Record<string, string> = {
  strongly_supports: 'Strongly for',
  supports: 'For',
  leans_support: 'Leans for',
  neutral: 'Neutral',
  mixed: 'Mixed',
  leans_oppose: 'Leans against',
  opposes: 'Against',
  strongly_opposes: 'Strongly against',
  unknown: 'Unknown',
}

export type Lane = 'for' | 'mixed' | 'against'

export const LANES: Record<Lane, { label: string; color: string; ink: string }> = {
  for: { label: 'For', color: 'var(--stance-for)', ink: '#047857' },
  mixed: { label: 'Mixed', color: 'var(--stance-mixed)', ink: '#B45309' },
  against: { label: 'Against', color: 'var(--stance-against)', ink: '#B91C1C' },
}

export function stanceLane(stance: string): Lane {
  const v = STANCE_NUMERIC[stance]
  if (v === undefined) return 'mixed'
  if (v >= 4) return 'for'
  if (v <= 2) return 'against'
  return 'mixed'
}

export function stanceWord(stance: string): string {
  return STANCE_WORD[stance] ?? stance.replace(/_/g, ' ')
}

export function stanceTone(stance: string) {
  return LANES[stanceLane(stance)]
}
