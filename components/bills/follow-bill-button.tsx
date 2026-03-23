'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/utils/analytics'

interface FollowBillButtonProps {
  billId: string
  className?: string
}

export function FollowBillButton({ billId, className }: FollowBillButtonProps) {
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
        .from('bill_follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('bill_id', billId)
        .maybeSingle()

      setFollowing(!!data)
      setLoading(false)
    }

    check()
  }, [billId])

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (following) {
      const { error } = await supabase
        .from('bill_follows')
        .delete()
        .eq('user_id', userId)
        .eq('bill_id', billId)
      if (!error) setFollowing(false)
    } else {
      const { error } = await supabase
        .from('bill_follows')
        .insert({ user_id: userId, bill_id: billId })
      if (!error) {
        setFollowing(true)
        trackEvent('bill_followed', { billId })
      }
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <button
        disabled
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-[var(--codex-border)] px-3 py-1.5 text-xs text-[var(--codex-faint)]',
          className
        )}
      >
        <BookmarkIcon filled={false} />
        ...
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]',
        following
          ? 'border-[var(--codex-input-focus)] bg-[var(--codex-badge-bg)] text-[var(--codex-text)]'
          : 'border-[var(--codex-border)] text-[var(--codex-sub)] hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)]',
        className
      )}
    >
      <BookmarkIcon filled={following} />
      {following ? 'Saved' : 'Save'}
    </button>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}
