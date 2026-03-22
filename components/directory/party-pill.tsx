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
      className="inline-flex items-center gap-1.5 rounded-full font-medium text-white"
      style={{
        background: color,
        fontSize: size === 'lg' ? 13 : 11,
        padding: size === 'lg' ? '5px 14px' : '3px 10px',
        gap: size === 'lg' ? 6 : 4,
      }}
    >
      <PartyIcon party={party} size={size === 'lg' ? 16 : 12} />
      {partyLabel(party)}
    </span>
  )
}
