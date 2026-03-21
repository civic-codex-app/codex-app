import Link from 'next/link'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { AvatarImage } from '@/components/ui/avatar-image'
import { CHAMBER_LABELS } from '@/lib/constants/chambers'
import { PartyIcon } from '@/components/icons/party-icons'

interface Candidate {
  id: string
  name: string
  party: string
  is_incumbent: boolean
  status: string
  image_url?: string | null
  politician_id?: string | null
}

interface RaceCardProps {
  race: {
    id: string
    slug: string
    name: string
    state: string
    chamber: string
    district?: string | null
    description?: string | null
    incumbent_id?: string | null
    candidates?: Candidate[]
    incumbent?: {
      id: string
      name: string
      party: string
      image_url?: string | null
      slug: string
    } | null
  }
}

export function RaceCard({ race }: RaceCardProps) {
  const candidates = race.candidates ?? []
  const incumbent = race.incumbent
  const chamberLabel = CHAMBER_LABELS[race.chamber as keyof typeof CHAMBER_LABELS] ?? race.chamber
  const challengers = candidates.filter((c) => !c.is_incumbent)

  // Party breakdown for visual
  const partyGroups: Record<string, number> = {}
  for (const c of candidates) {
    partyGroups[c.party] = (partyGroups[c.party] || 0) + 1
  }
  const totalCandidates = candidates.length

  return (
    <Link
      href={`/elections/${race.slug}`}
      className="group block rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5 no-underline transition-all hover:border-[var(--codex-input-border)]"
    >
      {/* Party color bar at top */}
      {totalCandidates > 0 && (
        <div className="mb-4 flex h-1 overflow-hidden rounded-full">
          {Object.entries(partyGroups).map(([party, count]) => (
            <div
              key={party}
              style={{
                width: `${(count / totalCandidates) * 100}%`,
                background: partyColor(party),
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
          {chamberLabel}
        </span>
        <span className="text-[11px] font-medium text-[var(--codex-faint)]">
          {race.state}
          {race.district ? ` - District ${race.district}` : ''}
        </span>
      </div>

      <h3 className="mb-3 font-serif text-lg transition-colors group-hover:text-[var(--codex-text)]">
        {race.name}
      </h3>

      {/* Candidate avatar stack */}
      {candidates.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <div className="flex -space-x-2">
            {candidates.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="h-7 w-7 overflow-hidden rounded-full bg-[var(--codex-bg)]"
                style={{ border: `2px solid ${partyColor(c.party)}44` }}
                title={`${c.name} (${partyLabel(c.party)})`}
              >
                {c.image_url ? (
                  <AvatarImage
                    src={c.image_url}
                    alt={c.name}
                    size={28}
                    fallbackColor={partyColor(c.party)}
                    party={c.party}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-[9px] font-medium"
                    style={{ color: partyColor(c.party), background: `${partyColor(c.party)}12` }}
                  >
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
            ))}
            {candidates.length > 5 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--codex-badge-bg)] text-[9px] text-[var(--codex-faint)]"
                style={{ border: '2px solid var(--codex-border)' }}
              >
                +{candidates.length - 5}
              </div>
            )}
          </div>
          {/* Party icons */}
          <div className="flex items-center gap-1.5">
            {Object.keys(partyGroups).map((party) => (
              <PartyIcon key={party} party={party} size={11} />
            ))}
          </div>
        </div>
      )}

      {race.description && (
        <p className="mb-3 line-clamp-2 text-[12px] leading-[1.6] text-[var(--codex-sub)]">
          {race.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-[11px] text-[var(--codex-faint)]">
          {challengers.length > 0
            ? `${challengers.length} challenger${challengers.length !== 1 ? 's' : ''}`
            : 'No challengers yet'}
        </div>
        {incumbent && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--codex-faint)]">Incumbent:</span>
            <span className="text-[11px] font-medium text-[var(--codex-sub)]">{incumbent.name}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
