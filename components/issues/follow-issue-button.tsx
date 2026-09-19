'use client'

import { useState, useEffect } from 'react'
import { createClient, getLocalUser } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/utils/analytics'

interface FollowIssueButtonProps {
  issueId: string
  /** Optional: the button asks /api/issue-follow itself once it knows who is signed in. */
  initialFollowing?: boolean
  initialCount?: number
  className?: string
}

export function FollowIssueButton({ issueId, initialFollowing = false, initialCount = 0, className }: FollowIssueButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)

  // Resolve the signed-in user and whether they follow this issue here, on the
  // client, so the issue page itself never reads cookies and can stay in its
  // hourly static cache.
  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    getLocalUser(supabase).then(async ({ data: { user } }) => {
      if (!user || cancelled) return
      setUserId(user.id)
      try {
        const res = await fetch('/api/issue-follow')
        if (!res.ok) return
        const data = await res.json()
        const followed: string[] = Array.isArray(data) ? data : data.followed ?? []
        if (!cancelled) setFollowing(followed.includes(issueId))
      } catch {
        // Leave the initial state; the toggle still works.
      }
    })
    return () => { cancelled = true }
  }, [issueId])

  async function handleToggle() {
    if (!userId) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    const prev = following
    // Optimistic update
    setFollowing(!prev)
    setCount((c) => prev ? Math.max(0, c - 1) : c + 1)

    try {
      const res = await fetch('/api/issue-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId }),
      })

      if (!res.ok) {
        setFollowing(prev)
        setCount((c) => prev ? c + 1 : Math.max(0, c - 1))
      } else {
        const data = await res.json()
        setFollowing(data.following)
        if (data.following) {
          trackEvent('issue_followed', { issueId })
        }
      }
    } catch {
      setFollowing(prev)
      setCount((c) => prev ? c + 1 : Math.max(0, c - 1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
        following
          ? 'border-[var(--poli-input-focus)] bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
          : 'border-[var(--poli-border)] text-[var(--poli-sub)] hover:border-[var(--poli-input-focus)] hover:text-[var(--poli-text)]',
        loading && 'opacity-50',
        className
      )}
    >
      {following ? 'Following' : 'Follow'}
      {count > 0 && <span className="text-[var(--poli-faint)]">{count}</span>}
    </button>
  )
}
