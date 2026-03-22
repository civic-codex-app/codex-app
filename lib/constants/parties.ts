export const PARTIES = {
  democrat: { label: 'Democratic', color: '#2563EB' },
  republican: { label: 'Republican', color: '#DC2626' },
  green: { label: 'Green', color: '#16A34A' },
  independent: { label: 'Independent', color: '#7C3AED' },
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
