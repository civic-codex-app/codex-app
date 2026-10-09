import Link from 'next/link'
import { Card, Chip } from '@/components/app/surface'

interface VoteRow {
  id?: string
  bill_name: string | null
  bill_number: string | null
  bill_id: string | null
  vote: string
  vote_date: string | null
}

const VOTE: Record<string, { label: string; tone: 'good' | 'warn' | 'neutral' }> = {
  yea: { label: 'Yea', tone: 'good' },
  nay: { label: 'Nay', tone: 'warn' },
  abstain: { label: 'Abstain', tone: 'neutral' },
  not_voting: { label: 'Not voting', tone: 'neutral' },
}

/**
 * Votes. voting_records holds no rows today — the 3,838 that existed joined
 * real members to misidentified bills and were deleted (CLAUDE.md, Data
 * Integrity) — so for now this is the honest empty state, written so it
 * fills in by itself once roll calls are imported.
 */
export function VotesCard({ votes, pronoun }: { votes: VoteRow[]; pronoun: string }) {
  const recent = [...votes].sort((a, b) => (b.vote_date ?? '').localeCompare(a.vote_date ?? '')).slice(0, 5)
  return (
    <Card className="mb-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">Votes</h2>
        {recent.length === 0 && <Chip>Coming soon</Chip>}
      </div>
      {recent.length === 0 ? (
        <p className="mt-2 text-[14px] leading-[1.45] text-[var(--poli-sub)]">
          {`${pronoun} roll calls appear here once they are imported. We’d rather wait for the real ones than guess.`}
        </p>
      ) : (
        <div className="mt-1">
          {recent.map((v, i) => {
            const c = VOTE[v.vote] ?? { label: v.vote, tone: 'neutral' as const }
            const inner = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold leading-[1.3] text-[var(--poli-text)]">{v.bill_name ?? v.bill_number}</span>
                  <span className="block text-[12.5px] text-[var(--poli-sub)]">
                    {[v.bill_number, v.vote_date].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <Chip tone={c.tone}>{c.label}</Chip>
              </>
            )
            const cls = `flex min-h-[56px] items-center gap-3 no-underline ${i < recent.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`
            return v.bill_id ? (
              <Link key={v.id ?? i} href={`/bills/${v.bill_id}`} className={cls}>{inner}</Link>
            ) : (
              <div key={v.id ?? i} className={cls}>{inner}</div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
