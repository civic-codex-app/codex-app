'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/utils/analytics'

interface LikeButtonProps {
  politicianId: string
  initialCount?: number
  className?: string
}

export function LikeButton({ politicianId, initialCount = 0, className }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function check() {
      // Read the total from public_like_counts, not from `likes` itself.
      // Counting the table from the browser requires SELECT on every row,
      // which made the whole per-user like graph readable by anyone holding
      // the anon key. The view exposes the total and nothing else.
      //
      // Falls back to counting the table so this keeps working before
      // 028_like_counts_view.sql has been applied; once it has, the table is
      // restricted to own-rows and the fallback returns 0, which the view
      // path has already covered.
      const { data: agg, error: aggError } = await supabase
        .from('public_like_counts')
        .select('like_count')
        .eq('politician_id', politicianId)
        .maybeSingle()

      if (!aggError) {
        setCount(agg?.like_count ?? 0)
      } else {
        const { count: likeCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('politician_id', politicianId)
        if (likeCount !== null) setCount(likeCount)
      }

      // Check if user liked
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('politician_id', politicianId)
          .maybeSingle()
        setLiked(!!data)
      }

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

    if (liked) {
      // Unlike = also unfollow
      const [{ error: likeErr }, { error: followErr }] = await Promise.all([
        supabase.from('likes').delete().eq('user_id', userId).eq('politician_id', politicianId),
        supabase.from('follows').delete().eq('user_id', userId).eq('politician_id', politicianId),
      ])
      if (!likeErr) {
        setLiked(false)
        setCount((c) => Math.max(0, c - 1))
      }
    } else {
      // Like = also follow
      const [{ error: likeErr }, { error: followErr }] = await Promise.all([
        supabase.from('likes').insert({ user_id: userId, politician_id: politicianId }),
        supabase.from('follows').upsert(
          { user_id: userId, politician_id: politicianId },
          { onConflict: 'user_id,politician_id', ignoreDuplicates: true }
        ),
      ])
      if (!likeErr) {
        setLiked(true)
        setCount((c) => c + 1)
        trackEvent('politician_followed', { politicianId })
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
        liked
          ? 'border-red-500/30 bg-red-500/10 text-red-400'
          : 'border-[var(--poli-border)] text-[var(--poli-sub)] hover:border-red-500/30 hover:text-red-400',
        className
      )}
    >
      <span className="text-sm">{liked ? '♥' : '♡'}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
