'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PollOption {
  id: string
  label: string
  votes: number
  pct: number
}

interface PollVoteClientProps {
  pollId: string
  options: PollOption[]
  hasVoted: boolean
  votedOptionId: string | null
  isActive: boolean
  totalVotes: number
}

export function PollVoteClient({
  pollId,
  options: initialOptions,
  hasVoted: initialHasVoted,
  votedOptionId: initialVotedOptionId,
  isActive,
  totalVotes: initialTotalVotes,
}: PollVoteClientProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(initialVotedOptionId)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localVotes, setLocalVotes] = useState(initialTotalVotes)
  const [localOptions, setLocalOptions] = useState(initialOptions)

  const showResults = hasVoted || !isActive

  async function handleVote(optionId: string) {
    if (hasVoted || !isActive || loading) return

    setSelected(optionId)
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        if (!hasVoted) setSelected(null)
        setLoading(false)
        return
      }

      // Update local state with returned results
      setHasVoted(true)
      const newTotal = localVotes + 1
      setLocalVotes(newTotal)
      setLocalOptions((prev) =>
        prev.map((opt) => {
          const newVoteCount = opt.id === optionId ? opt.votes + 1 : opt.votes
          return {
            ...opt,
            votes: newVoteCount,
            pct: newTotal > 0 ? Math.round((newVoteCount / newTotal) * 100) : 0,
          }
        })
      )
      router.refresh()
    } catch {
      setError('Failed to submit vote. Please try again.')
      if (!hasVoted) setSelected(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {!showResults && (
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          Cast your vote
        </p>
      )}
      {showResults && (
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          Results &middot; {localVotes} total vote{localVotes !== 1 ? 's' : ''}
        </p>
      )}

      {localOptions.map((option) => {
        const isSelected = selected === option.id
        const isWinning =
          showResults &&
          option.votes === Math.max(...localOptions.map((o) => o.votes)) &&
          option.votes > 0

        return (
          <button
            key={option.id}
            onClick={() => handleVote(option.id)}
            disabled={loading || hasVoted || !isActive}
            className={cn(
              'relative w-full overflow-hidden rounded-md border px-5 py-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]',
              isSelected
                ? 'border-[var(--codex-input-focus)] bg-[var(--codex-badge-bg)]'
                : 'border-[var(--codex-border)] hover:border-[var(--codex-input-border)]',
              (hasVoted || !isActive) && 'cursor-default'
            )}
          >
            {/* Animated progress bar background */}
            {showResults && (
              <div
                className={cn(
                  'absolute inset-y-0 left-0 transition-all duration-700 ease-out',
                  isWinning
                    ? 'bg-[var(--codex-text)] opacity-[0.07]'
                    : 'bg-[var(--codex-text)] opacity-[0.03]'
                )}
                style={{ width: `${option.pct}%` }}
              />
            )}

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Radio circle when voting */}
                {!showResults && (
                  <div
                    className={cn(
                      'h-4 w-4 flex-shrink-0 rounded-full border-2 transition-colors',
                      isSelected
                        ? 'border-[var(--codex-text)] bg-[var(--codex-text)]'
                        : 'border-[var(--codex-border)]'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected || isWinning
                      ? 'text-[var(--codex-text)]'
                      : 'text-[var(--codex-sub)]'
                  )}
                >
                  {option.label}
                </span>
                {isSelected && showResults && (
                  <span className="text-[10px] text-[var(--codex-faint)]">Your vote</span>
                )}
              </div>
              {showResults && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--codex-faint)]">
                    {option.votes}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      isWinning ? 'text-[var(--codex-text)]' : 'text-[var(--codex-sub)]'
                    )}
                  >
                    {option.pct}%
                  </span>
                </div>
              )}
            </div>
          </button>
        )
      })}

      {/* Error message */}
      {error && (
        <p className="mt-3 text-center text-xs text-red-400">{error}</p>
      )}

      {/* Loading indicator */}
      {loading && (
        <p className="mt-3 text-center text-xs text-[var(--codex-faint)]">
          Submitting your vote...
        </p>
      )}
    </div>
  )
}
