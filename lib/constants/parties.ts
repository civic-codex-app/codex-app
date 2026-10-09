/**
 * One entry per value of the party_type enum (supabase/migrations/031).
 *
 * The minor parties are here because a candidate's party is a fact about the
 * ballot. Before 031 every one of them was stored and shown as Independent,
 * which is false. Colours are kept apart from the four majors so the party
 * ring on a photo still reads at a glance.
 */
export const PARTIES = {
  democrat: { label: 'Democratic', abbr: 'D', color: '#2563EB' },
  republican: { label: 'Republican', abbr: 'R', color: '#DC2626' },
  green: { label: 'Green', abbr: 'G', color: '#16A34A' },
  independent: { label: 'Independent', abbr: 'I', color: '#7C3AED' },
  libertarian: { label: 'Libertarian', abbr: 'L', color: '#CA8A04' },
  constitution: { label: 'Constitution', abbr: 'C', color: '#92400E' },
  us_taxpayers: { label: 'U.S. Taxpayers', abbr: 'UST', color: '#78350F' },
  natural_law: { label: 'Natural Law', abbr: 'NL', color: '#0F766E' },
  working_class: { label: 'Working Class', abbr: 'WC', color: '#BE185D' },
} as const

export type PartyKey = keyof typeof PARTIES

export function partyColor(party: string): string {
  const key = party.toLowerCase() as PartyKey
  return PARTIES[key]?.color ?? PARTIES.independent.color
}

export function partyLabel(party: string): string {
  const key = party.toLowerCase() as PartyKey
  return PARTIES[key]?.label ?? party
}

export function partyAbbr(party: string): string {
  const key = party.toLowerCase() as PartyKey
  return PARTIES[key]?.abbr ?? party.charAt(0).toUpperCase()
}
