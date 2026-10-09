import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor } from '@/lib/constants/parties'

/**
 * The one avatar. A circle: the photo, or ink initials on the card colour
 * when there is none, with the party as a 2px ring and a 2px gap of card
 * colour between ring and face so stacked faces read as separate people.
 * Sizes used across the screens: 28, 32, 40, 44, 56, 64, 96.
 */
export function Face({
  src,
  alt,
  size,
  party,
  className = '',
}: {
  src: string | null | undefined
  alt: string
  size: number
  party?: string | null
  className?: string
}) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-full bg-[var(--poli-card)] ${className}`}
      style={{
        width: size,
        height: size,
        border: '2px solid var(--poli-card)',
        boxShadow: party ? `0 0 0 2px ${partyColor(party)}` : undefined,
      }}
    >
      <AvatarImage src={src} alt={alt} size={size} className="h-full w-full object-cover object-top" />
    </span>
  )
}

/** Up to `max` faces overlapping, newest-left, for a row that is about several people. */
export function FaceStack({
  people,
  size = 30,
  max = 3,
}: {
  people: Array<{ src: string | null | undefined; alt: string; party?: string | null }>
  size?: number
  max?: number
}) {
  const shown = people.slice(0, max)
  if (!shown.length) return null
  return (
    <span className="flex shrink-0">
      {shown.map((p, i) => (
        <Face
          key={`${p.alt}-${i}`}
          src={p.src}
          alt={p.alt}
          size={size}
          party={p.party}
          className={i === 0 ? '' : '-ml-2'}
        />
      ))}
    </span>
  )
}
