'use client'

import Link from 'next/link'

interface PollOption {
  id: string
  text: string
  vote_count: number
}

interface Props {
  poll: {
    id: string
    question: string
    options: PollOption[]
    total_votes: number
  }
}

export function PollCard({ poll }: Props) {
  const maxVotes = Math.max(...poll.options.map((o) => o.vote_count), 1)

  return (
    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
          <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
        </svg>
        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-purple-400">
          Community Poll
        </span>
        <span className="ml-auto text-[11px] text-[var(--poli-faint)]">
          {poll.total_votes.toLocaleString()} votes
        </span>
      </div>

      <p className="mb-4 text-[15px] font-semibold leading-[1.3] text-[var(--poli-text)]">
        {poll.question}
      </p>

      <div className="space-y-2">
        {poll.options.slice(0, 4).map((opt) => {
          const pct = poll.total_votes > 0 ? Math.round((opt.vote_count / poll.total_votes) * 100) : 0
          return (
            <div key={opt.id} className="relative overflow-hidden rounded-lg bg-[var(--poli-bg)] px-3 py-2">
              <div
                className="absolute inset-y-0 left-0 rounded-lg bg-purple-500/10"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-[13px] text-[var(--poli-text)]">{opt.text}</span>
                <span className="text-[12px] font-medium text-purple-400">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <Link
        href={`/polls`}
        className="mt-3 inline-block text-[12px] font-medium text-purple-400 no-underline hover:underline"
      >
        Vote &rarr;
      </Link>
    </div>
  )
}
