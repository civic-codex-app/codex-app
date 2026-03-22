import Link from 'next/link'

interface VotingHistoryProps {
  votes: Array<{
    id: string
    bill_name: string | null
    bill_number: string | null
    bill_id: string | null
    vote: string
    vote_date: string | null
  }>
}

const VOTE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  yea: { label: 'Yea', color: '#22C55E', bg: '#22C55E18' },
  nay: { label: 'Nay', color: '#EF4444', bg: '#EF444418' },
  abstain: { label: 'Abstain', color: '#EAB308', bg: '#EAB30818' },
  not_voting: { label: 'Not Voting', color: '#6B7280', bg: '#6B728018' },
}

export function VotingHistory({ votes }: VotingHistoryProps) {
  if (votes.length === 0) return null

  const yea = votes.filter((v) => v.vote === 'yea').length
  const nay = votes.filter((v) => v.vote === 'nay').length
  const other = votes.length - yea - nay

  return (
    <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
      <h2 className="mb-1 text-sm font-semibold text-[var(--codex-sub)]">
        Voting Record
      </h2>
      <p className="mb-4 text-[11px] text-[var(--codex-faint)]">
        How this official voted on recent legislation
      </p>

      {/* Summary bar */}
      <div className="mb-4 rounded-md border border-[var(--codex-border)] p-3">
        <div className="mb-2 flex h-2 overflow-hidden rounded-full">
          {yea > 0 && <div style={{ width: `${(yea / votes.length) * 100}%`, background: '#22C55E99' }} />}
          {nay > 0 && <div style={{ width: `${(nay / votes.length) * 100}%`, background: '#EF444499' }} />}
          {other > 0 && <div style={{ width: `${(other / votes.length) * 100}%`, background: 'var(--codex-border)' }} />}
        </div>
        <div className="flex gap-4 text-[11px]">
          <span className="text-green-400/70">{yea} yea</span>
          <span className="text-red-400/70">{nay} nay</span>
          {other > 0 && <span className="text-[var(--codex-faint)]">{other} other</span>}
          <span className="ml-auto text-[var(--codex-faint)]">{votes.length} votes</span>
        </div>
      </div>

      {/* Vote list */}
      <div className="space-y-1.5">
        {votes.slice(0, 10).map((v) => {
          const vc = VOTE_CONFIG[v.vote] ?? VOTE_CONFIG.not_voting
          const inner = (
            <div className="flex items-center justify-between rounded-md border border-[var(--codex-border)] px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] text-[var(--codex-text)]">
                  {v.bill_name ?? v.bill_number ?? 'Unknown Bill'}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--codex-faint)]">
                  {v.bill_number && <span>{v.bill_number}</span>}
                  {v.vote_date && (
                    <span>
                      {new Date(v.vote_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
              <span
                className="rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.06em]"
                style={{ color: vc.color, background: vc.bg }}
              >
                {vc.label}
              </span>
            </div>
          )

          return v.bill_id ? (
            <Link key={v.id} href={`/bills/${v.bill_id}`} className="block no-underline transition-all hover:opacity-80">
              {inner}
            </Link>
          ) : (
            <div key={v.id}>{inner}</div>
          )
        })}
      </div>

      {votes.length > 10 && (
        <div className="mt-3 text-center text-[11px] text-[var(--codex-faint)]">
          Showing 10 of {votes.length} votes
        </div>
      )}
    </div>
  )
}
