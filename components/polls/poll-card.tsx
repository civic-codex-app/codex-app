import Link from 'next/link'

interface PollOption {
  id: string
  label: string
  sort_order: number
}

interface PollVote {
  id: string
  option_id: string
}

interface Poll {
  id: string
  title: string
  description: string | null
  poll_type: string
  status: string
  ends_at: string | null
  poll_options: PollOption[]
  poll_votes: PollVote[]
}

const TYPE_LABELS: Record<string, string> = {
  approval: 'Approval',
  matchup: 'Matchup',
  issue: 'Issue',
}

export function PollCard({ poll }: { poll: Poll }) {
  const totalVotes = poll.poll_votes?.length ?? 0

  return (
    <Link
      href={`/polls/${poll.id}`}
      className="group block rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-6 no-underline transition-all hover:border-[var(--codex-input-border)]"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
          {TYPE_LABELS[poll.poll_type] ?? poll.poll_type}
        </span>
        {poll.status === 'closed' && (
          <span className="rounded-sm bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-red-400">
            Closed
          </span>
        )}
      </div>

      <h3 className="mb-2 text-xl font-semibold transition-colors group-hover:text-[var(--codex-text)]">
        {poll.title}
      </h3>

      {poll.description && (
        <p className="mb-4 line-clamp-2 text-sm text-[var(--codex-sub)]">{poll.description}</p>
      )}

      {/* Mini results preview */}
      <div className="mb-3 space-y-1.5">
        {(poll.poll_options ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .slice(0, 3)
          .map((option) => {
            const optionVotes = poll.poll_votes?.filter((v) => v.option_id === option.id).length ?? 0
            const pct = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0
            return (
              <div key={option.id} className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--codex-badge-bg)]">
                  <div
                    className="h-full rounded-full bg-[var(--codex-sub)] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 truncate text-[11px] text-[var(--codex-faint)]">
                  {option.label}
                </span>
              </div>
            )
          })}
      </div>

      <div className="text-[11px] text-[var(--codex-faint)]">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        {poll.ends_at && (
          <>
            {' '}
            &middot; {poll.status === 'closed' ? 'Ended' : 'Ends'}{' '}
            {new Date(poll.ends_at).toLocaleDateString()}
          </>
        )}
      </div>
    </Link>
  )
}
