import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor, partyLabel } from '@/lib/constants/parties'

interface PartyPillProps {
  party: string
  size?: 'sm' | 'lg'
}

export function PartyPill({ party, size = 'sm' }: PartyPillProps) {
  const color = partyColor(party)
  return (
    <span
      className="inline-flex items-center gap-1.5 font-sans font-semibold uppercase tracking-[0.08em]"
      style={{
        color,
        fontSize: size === 'lg' ? 13 : 11,
        gap: size === 'lg' ? 8 : 6,
      }}
    >
      <PartyIcon party={party} size={size === 'lg' ? 20 : 14} />
      {partyLabel(party)}
    </span>
  )
}
