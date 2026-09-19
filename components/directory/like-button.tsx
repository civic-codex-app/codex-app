'use client'

import { useEffect, useOptimistic, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSessionUser } from '@/lib/hooks/use-session-user'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/utils/analytics'

interface LikeButtonProps {
  politicianId: string
  initialCount?: number
  className?: string
}

type LikeState = { liked: boolean; count: number }

/**
 * Like (which also follows).
 *
 * Previously this button ignored you twice: it mounted `disabled` while an
 * auth round-trip resolved, then disabled itself again for the duration of two
 * Supabase writes. The heart only moved once the network came back. A control
 * that does nothing when pressed is the single clearest "this is a web page"
 * signal there is.
 *
 * Now the heart flips on the same frame as the tap and the writes happen
 * behind it. useOptimistic drops the optimistic value automatically if the
 * transition ends without the real state agreeing, so a failed write rolls
 * back on its own.
 */
export function LikeButton({ politicianId, initialCount = 0, className }: LikeButtonProps) {
  const userId = useSessionUser()
  const [truth, setTruth] = useState<LikeState>({ liked: false, count: initialCount })
  const [optimistic, applyOptimistic] = useOptimistic(
    truth,
    (state, nextLiked: boolean): LikeState => ({
      liked: nextLiked,
      count: Math.max(0, state.count + (nextLiked ? 1 : -1)),
    })
  )
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      // Read the total from public_like_counts, not from `likes` itself.
      // Counting the table from the browser requires SELECT on every row,
      // which made the whole per-user like graph readable by anyone holding
      // the anon key. The view exposes the total and nothing else.
      let count = initialCount
      const { data: agg, error: aggError } = await supabase
        .from('public_like_counts')
        .select('like_count')
        .eq('politician_id', politicianId)
        .maybeSingle()

      if (!aggError) {
        count = agg?.like_count ?? 0
      } else {
        const { count: likeCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('politician_id', politicianId)
        if (likeCount !== null) count = likeCount
      }

      let liked = false
      if (userId) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', userId)
          .eq('politician_id', politicianId)
          .maybeSingle()
        liked = !!data
      }

      if (!cancelled) setTruth({ liked, count })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [politicianId, userId, initialCount])

  function handleToggle() {
    if (userId === undefined) return // session not resolved yet
    if (userId === null) {
      window.location.href = '/login'
      return
    }

    const next = !optimistic.liked
    const supabase = createClient()

    startTransition(async () => {
      applyOptimistic(next)

      const writes = next
        ? [
            supabase.from('likes').insert({ user_id: userId, politician_id: politicianId }),
            supabase.from('follows').upsert(
              { user_id: userId, politician_id: politicianId },
              { onConflict: 'user_id,politician_id', ignoreDuplicates: true }
            ),
          ]
        : [
            supabase.from('likes').delete().eq('user_id', userId).eq('politician_id', politicianId),
            supabase.from('follows').delete().eq('user_id', userId).eq('politician_id', politicianId),
          ]

      const [likeResult] = await Promise.all(writes)
      // On failure, returning without touching `truth` lets React discard the
      // optimistic value when the transition ends — the heart springs back.
      if (likeResult.error) return

      setTruth((t) => ({ liked: next, count: Math.max(0, t.count + (next ? 1 : -1)) }))
      if (next) trackEvent('politician_followed', { politicianId })
    })
  }

  return (
    <button
      onClick={handleToggle}
      aria-pressed={optimistic.liked}
      aria-label={optimistic.liked ? 'Unlike' : 'Like'}
      className={cn(
        // min-h-[44px] is Apple's minimum touch target; this was ~28px tall.
        // press-scale supplies the depress (see the press layer in globals.css).
        'press-scale inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
        optimistic.liked
          ? 'border-red-500/30 bg-red-500/10 text-red-400'
          : 'border-[var(--poli-border)] text-[var(--poli-sub)] hover:border-red-500/30 hover:text-red-400',
        className
      )}
    >
      <span className="text-sm">{optimistic.liked ? '♥' : '♡'}</span>
      {/* tabular-nums so an optimistic increment cannot reflow the button */}
      {optimistic.count > 0 && <span className="tabular-nums">{optimistic.count}</span>}
    </button>
  )
}
