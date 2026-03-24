'use client'

import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

interface Props {
  records: Array<{
    politician: {
      name: string
      slug: string
      party: string
      image_url: string | null
    }
    cycle: number
    total_raised: number
    total_spent: number
    cash_on_hand: number
  }>
  label?: string
}

export function FinanceHighlightCard({ records, label = 'Top Fundraisers' }: Props) {
  if (!records.length) return null

  return (
    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-green-500">
          {label}
        </span>
      </div>

      <div className="space-y-3">
        {records.map((r, i) => {
          const color = partyColor(r.politician.party)
          const maxRaised = records[0].total_raised || 1
          const pct = Math.round((r.total_raised / maxRaised) * 100)

          return (
            <Link
              key={i}
              href={`/politicians/${r.politician.slug}`}
              className="group flex items-center gap-3 no-underline"
            >
              <span className="w-4 text-center text-[12px] font-bold text-[var(--poli-faint)]">
                {i + 1}
              </span>
              <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                <AvatarImage
                  src={r.politician.image_url}
                  alt={r.politician.name}
                  size={32}
                  party={r.politician.party}
                  fallbackColor={color}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <PartyIcon party={r.politician.party} size={10} />
                  <span className="truncate text-[13px] font-medium text-[var(--poli-text)] group-hover:text-blue-400">
                    {r.politician.name}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--poli-bg)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
              <span className="flex-shrink-0 text-[13px] font-semibold text-green-500">
                {formatMoney(r.total_raised)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
