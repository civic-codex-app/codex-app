'use client'

import Link from 'next/link'
import { Chip } from '@/components/app/surface'
import { Face } from '@/components/app/face'
import { useLocation } from '@/lib/hooks/use-location'

const VOTE: Record<string, { label: string; tone: 'good' | 'warn' | 'neutral' }> = {
  yea: { label: 'Yea', tone: 'good' },
  nay: { label: 'Nay', tone: 'warn' },
  abstain: { label: 'Abstain', tone: 'neutral' },
  not_voting: { label: 'Not voting', tone: 'neutral' },
}

/**
 * How your people voted on this bill: your senators and representative with
 * their recorded vote, or a dash where none is on file. Governors do not
 * vote in Congress and are not listed. voting_records is empty today, so
 * the dashes are the honest state until roll calls are imported.
 */
export function YourPeopleVoted({ votes }: { votes: Record<string, string> }) {
  const loc = useLocation()
  if (!loc.ready) return null
  if (!loc.zip) {
    return (
      <p className="text-[13.5px] leading-[1.5] text-[var(--poli-sub)]">
        <Link href="/" className="font-semibold text-[var(--poli-text)] no-underline">Enter your ZIP on Home</Link> to see how your representatives voted.
      </p>
    )
  }
  const reps = (loc.reps ?? []).filter((r) => r.chamber === 'senate' || r.chamber === 'house')
  if (!reps.length) return <p className="text-[13.5px] text-[var(--poli-sub)]">No members of Congress on file for {loc.zip}.</p>
  return (
    <div>
      {reps.map((r, i) => {
        const v = votes[r.id]
        const c = v ? VOTE[v] ?? { label: v, tone: 'neutral' as const } : null
        return (
          <Link key={r.id} href={`/politicians/${r.slug}`} className={`flex min-h-[48px] items-center gap-3 no-underline ${i < reps.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}>
            <Face src={r.image_url} alt={r.name} size={36} party={r.party} />
            <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-[var(--poli-text)]">{r.name}</span>
            {c ? <Chip tone={c.tone}>{c.label}</Chip> : <span className="text-[14px] text-[var(--poli-faint)]">—</span>}
          </Link>
        )
      })}
      {reps.some((r) => !votes[r.id]) && (
        <p className="mt-2 text-[12.5px] text-[var(--poli-sub)]">Fills in when the roll calls are imported.</p>
      )}
    </div>
  )
}
