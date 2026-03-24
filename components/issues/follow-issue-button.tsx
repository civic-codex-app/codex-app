'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/utils/analytics'

interface FollowIssueButtonProps {
  issueId: string
  initialFollowing: boolean
  className?: string
}

export function FollowIssueButton({ issueId, initialFollowing, className }: FollowIssueButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const prev = following
    // Optimistic update
    setFollowing(!prev)

    try {
      const res = await fetch('/api/issue-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId }),
      })

      if (!res.ok) {
        // Revert on error
        setFollowing(prev)
      } else {
        const data = await res.json()
        setFollowing(data.following)
        if (data.following) {
          trackEvent('issue_followed', { issueId })
        }
      }
    } catch {
      setFollowing(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'rounded-md border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
        following
          ? 'border-[var(--poli-input-focus)] bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
          : 'border-[var(--poli-border)] text-[var(--poli-sub)] hover:border-[var(--poli-input-focus)] hover:text-[var(--poli-text)]',
        loading && 'opacity-50',
        className
      )}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
