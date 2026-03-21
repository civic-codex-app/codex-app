import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'

export interface LikeMindedPolitician {
  id: string
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  image_url: string | null
  overlap: number // 0-100 similarity score
}

interface LikeMindedProps {
  politicians: LikeMindedPolitician[]
}

export function LikeMinded({ politicians }: LikeMindedProps) {
  if (politicians.length === 0) return null

  return (
    <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
      <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
        Like-Minded Officials
      </h2>
      <div className="grid gap-2">
        {politicians.map((p) => {
          const color = partyColor(p.party)
          return (
            <Link
              key={p.id}
              href={`/politicians/${p.slug}`}
              className="group flex items-center gap-3 rounded-md border border-[var(--codex-border)] px-4 py-2.5 no-underline transition-all hover:border-[var(--codex-input-border)]"
            >
              {/* Avatar */}
              <div
                className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[var(--codex-card)]"
                style={{ border: `1.5px solid ${color}44` }}
              >
                <AvatarImage
                  src={p.image_url}
                  alt={p.name}
                  size={32}
                  fallbackColor={color}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-medium transition-colors group-hover:text-[var(--codex-text)]">
                    {p.name}
                  </span>
                  <PartyIcon party={p.party} size={10} />
                </div>
                <div className="text-[11px] text-[var(--codex-faint)]">
                  {p.state} · {p.chamber === 'senate' ? 'Senate' : p.chamber === 'house' ? 'House' : p.chamber === 'governor' ? 'Governor' : p.chamber}
                </div>
              </div>

              {/* Similarity */}
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 overflow-hidden rounded-full bg-[var(--codex-border)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.overlap}%`,
                      background: color,
                      opacity: 0.6,
                    }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-[var(--codex-faint)]">
                  {p.overlap}%
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
