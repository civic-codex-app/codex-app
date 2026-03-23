'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/utils/analytics'

interface FollowButtonProps {
  politicianId: string
  className?: string
}

export function FollowButton({ politicianId, className }: FollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('politician_id', politicianId)
        .maybeSingle()

      setFollowing(!!data)
      setLoading(false)
    }

    check()
  }, [politicianId])

  async function handleToggle() {
    if (!userId) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (following) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('user_id', userId)
        .eq('politician_id', politicianId)
      if (!error) setFollowing(false)
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ user_id: userId, politician_id: politicianId })
      if (!error) {
        setFollowing(true)
        trackEvent('politician_followed', { politicianId })
      }
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <button
        disabled
        className={cn(
          'rounded-md border border-[var(--codex-border)] px-4 py-2 text-xs text-[var(--codex-faint)]',
          className
        )}
      >
        ...
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'rounded-md border px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]',
        following
          ? 'border-[var(--codex-input-focus)] bg-[var(--codex-badge-bg)] text-[var(--codex-text)]'
          : 'border-[var(--codex-border)] text-[var(--codex-sub)] hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)]',
        className
      )}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
