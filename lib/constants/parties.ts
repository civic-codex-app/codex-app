export const PARTIES = {
  democrat: { label: 'Democratic', abbr: 'D', color: '#2563EB' },
  republican: { label: 'Republican', abbr: 'R', color: '#DC2626' },
  green: { label: 'Green', abbr: 'G', color: '#16A34A' },
  independent: { label: 'Independent', abbr: 'I', color: '#7C3AED' },
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
