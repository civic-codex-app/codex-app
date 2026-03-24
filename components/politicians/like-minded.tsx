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
    <div className="mt-8 border-t border-[var(--poli-border)] pt-6">
      <h2 className="mb-4 text-sm font-semibold text-[var(--poli-sub)]">
        Like-Minded Officials
      </h2>
      <div className="grid gap-2">
        {politicians.map((p) => {
          const color = partyColor(p.party)
          return (
            <Link
              key={p.id}
              href={`/politicians/${p.slug}`}
              className="group flex items-center gap-3 rounded-md border border-[var(--poli-border)] px-4 py-2.5 no-underline transition-all hover:border-[var(--poli-input-border)]"
            >
              {/* Avatar */}
              <div
                className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--poli-card)]"
                style={{ border: `1.5px solid ${color}44` }}
              >
                <AvatarImage
                  src={p.image_url}
                  alt={p.name}
                  size={32}
                  fallbackColor={color}
                  party={p.party}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-medium transition-colors group-hover:text-[var(--poli-text)]">
                    {p.name}
                  </span>
                  <PartyIcon party={p.party} size={10} />
                </div>
                <div className="text-[11px] text-[var(--poli-faint)]">
                  {p.state} · {p.chamber === 'senate' ? 'Senate' : p.chamber === 'house' ? 'House' : p.chamber === 'governor' ? 'Governor' : p.chamber}
                </div>
              </div>

              {/* Similarity */}
              <div className="flex items-center gap-2">
                <span className={`text-[12px] font-semibold tabular-nums ${
                  p.overlap > 70 ? 'text-emerald-600' : p.overlap >= 50 ? 'text-amber-600' : 'text-red-500'
                }`}>
                  {p.overlap}% match
                </span>
                <div className="h-1 w-16 overflow-hidden rounded-full bg-[var(--poli-border)]">
                  <div
                    className={`h-full rounded-full ${
                      p.overlap > 70 ? 'bg-emerald-500' : p.overlap >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${p.overlap}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
