'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'

interface TrendingPolitician {
  id: string
  name: string
  slug: string
  party: string
  state: string
  image_url: string | null
  title: string | null
  follow_count: number
}

export function Trending({ minTotalFollows = 0 }: { minTotalFollows?: number }) {
  const [data, setData] = useState<TrendingPolitician[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trending')
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          // Check minimum total follows threshold
          const totalFollows = json.reduce((sum: number, p: TrendingPolitician) => sum + p.follow_count, 0)
          if (minTotalFollows > 0 && totalFollows < minTotalFollows) {
            // Below threshold — hide section
            return
          }
          setData(json)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [minTotalFollows])

  // Loading skeleton
  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="mb-5 text-sm font-semibold text-[var(--poli-sub)]">
          Trending
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-[var(--poli-border)] p-4"
            >
              <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-[var(--poli-hover)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-24 animate-pulse rounded bg-[var(--poli-hover)]" />
                <div className="h-3 w-16 animate-pulse rounded bg-[var(--poli-hover)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Don't render if no data
  if (!data || data.length === 0) return null

  return (
    <div className="mb-12">
      <h2 className="mb-5 text-sm font-semibold text-[var(--poli-sub)]">
        Trending
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((pol) => {
          const color = partyColor(pol.party)
          return (
            <Link
              key={pol.id}
              href={`/politicians/${pol.slug}`}
              className="group flex items-center gap-3 rounded-lg border border-[var(--poli-border)] p-4 no-underline transition-all hover:border-[var(--poli-text)]"
            >
              {/* Avatar */}
              <div
                className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-[var(--poli-card)]"
                style={{ border: `2px solid ${color}44` }}
              >
                <AvatarImage
                  src={pol.image_url}
                  alt={pol.name}
                  size={44}
                  party={pol.party}
                  fallbackColor={color}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium text-[var(--poli-text)] transition-colors group-hover:text-[var(--poli-text)]">
                  {pol.name}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--poli-sub)]">
                  <PartyIcon party={pol.party} size={10} />
                  <span style={{ color }}>{pol.party.charAt(0).toUpperCase() + pol.party.slice(1)}</span>
                  <span className="text-[var(--poli-faint)]">·</span>
                  <span>{pol.state}</span>
                </div>
              </div>

              {/* Follow count */}
              <div className="flex-shrink-0 text-right">
                <div className="text-[14px] font-semibold tabular-nums text-[var(--poli-text)]">
                  {pol.follow_count}
                </div>
                <div className="text-[10px] text-[var(--poli-faint)]">followers</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
