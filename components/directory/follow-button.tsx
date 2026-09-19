'use client'

import { useEffect, useOptimistic, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSessionUser } from '@/lib/hooks/use-session-user'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/utils/analytics'

interface FollowButtonProps {
  politicianId: string
  className?: string
}

/**
 * Follow / Following.
 *
 * This was the worst of the toggles: it rendered a disabled "..." placeholder
 * until a network auth round-trip came back, so the control was dead on
 * arrival for a few hundred milliseconds, then disabled itself again for the
 * duration of each write. It now renders its real label immediately — the
 * session is read from the locally-held JWT — and the label flips on the same
 * frame as the tap.
 */
export function FollowButton({ politicianId, className }: FollowButtonProps) {
  const userId = useSessionUser()
  const [following, setFollowing] = useState(false)
  const [optimistic, applyOptimistic] = useOptimistic(following, (_state, next: boolean) => next)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    const supabase = createClient()
    supabase
      .from('follows')
      .select('id')
      .eq('user_id', userId)
      .eq('politician_id', politicianId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setFollowing(!!data)
      })
    return () => {
      cancelled = true
    }
  }, [politicianId, userId])

  function handleToggle() {
    if (userId === undefined) return
    if (userId === null) {
      window.location.href = '/login'
      return
    }

    const next = !optimistic
    const supabase = createClient()

    startTransition(async () => {
      applyOptimistic(next)

      const { error } = next
        ? await supabase.from('follows').insert({ user_id: userId, politician_id: politicianId })
        : await supabase
            .from('follows')
            .delete()
            .eq('user_id', userId)
            .eq('politician_id', politicianId)

      // Leaving `following` untouched lets React discard the optimistic value
      // when the transition ends, so a failed write reverts by itself.
      if (error) return

      setFollowing(next)
      if (next) trackEvent('politician_followed', { politicianId })
    })
  }

  return (
    <button
      onClick={handleToggle}
      aria-pressed={optimistic}
      className={cn(
        // min-h-[44px]: this was ~30px. press-scale supplies the depress.
        'press-scale inline-flex min-h-[44px] items-center rounded-md border px-4 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
        optimistic
          ? 'border-[var(--poli-input-focus)] bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
          : 'border-[var(--poli-border)] text-[var(--poli-sub)] hover:border-[var(--poli-input-focus)] hover:text-[var(--poli-text)]',
        className
      )}
    >
      {optimistic ? 'Following' : 'Follow'}
    </button>
  )
}
