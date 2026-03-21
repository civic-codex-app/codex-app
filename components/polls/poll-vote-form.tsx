'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface PollOption {
  id: string
  label: string
  votes: number
  pct: number
}

interface PollVoteFormProps {
  pollId: string
  options: PollOption[]
  userVoteOptionId: string | null
  isActive: boolean
  isLoggedIn: boolean
  totalVotes: number
}

export function PollVoteForm({
  pollId,
  options,
  userVoteOptionId,
  isActive,
  isLoggedIn,
  totalVotes,
}: PollVoteFormProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(userVoteOptionId)
  const [hasVoted, setHasVoted] = useState(!!userVoteOptionId)
  const [loading, setLoading] = useState(false)
  const [localVotes, setLocalVotes] = useState(totalVotes)
  const [localOptions, setLocalOptions] = useState(options)

  const showResults = hasVoted || !isActive

  async function handleVote(optionId: string) {
    if (!isLoggedIn) {
      window.location.href = '/login?redirectTo=/polls/' + pollId
      return
    }

    if (hasVoted || !isActive) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('poll_votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: (await supabase.auth.getUser()).data.user!.id,
    })

    if (!error) {
      setSelected(optionId)
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
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
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
            {/* Progress bar background */}
            {showResults && (
              <div
                className={cn(
                  'absolute inset-y-0 left-0 transition-all duration-500',
                  isWinning
                    ? 'bg-[var(--codex-text)] opacity-[0.06]'
                    : 'bg-[var(--codex-text)] opacity-[0.03]'
                )}
                style={{ width: `${option.pct}%` }}
              />
            )}

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!showResults && (
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border-2 transition-colors',
                      isSelected
                        ? 'border-[var(--codex-text)] bg-[var(--codex-text)]'
                        : 'border-[var(--codex-border)]'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-[var(--codex-text)]' : 'text-[var(--codex-sub)]'
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
                  <span className="text-xs text-[var(--codex-faint)]">{option.votes}</span>
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

      {!isLoggedIn && isActive && (
        <p className="mt-4 text-center text-xs text-[var(--codex-faint)]">
          <a href={`/login?redirectTo=/polls/${pollId}`} className="underline">
            Sign in
          </a>{' '}
          to vote
        </p>
      )}
    </div>
  )
}
