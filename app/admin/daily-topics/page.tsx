'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface DailyTopic {
  id: string
  title: string
  summary: string | null
  source_url: string | null
  source_name: string | null
  image_url: string | null
  issue_id: string | null
  is_pinned: boolean
  is_active: boolean
  published_at: string
  created_at: string
  issues: { name: string; slug: string } | null
  daily_topic_politicians: {
    politician_id: string
    politicians: { name: string; slug: string; party: string }
  }[]
}

export default function DailyTopicsPage() {
  const [topics, setTopics] = useState<DailyTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'active' | 'inactive' | 'all'>('active')
  const supabase = createBrowserClient()

  const fetchTopics = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('daily_topics')
      .select(`
        id, title, summary, source_url, source_name, image_url,
        issue_id, is_pinned, is_active, published_at, created_at,
        issues(name, slug),
        daily_topic_politicians(
          politician_id,
          politicians(name, slug, party)
        )
      `)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(50)

    if (filter === 'active') query = query.eq('is_active', true)
    if (filter === 'inactive') query = query.eq('is_active', false)

    const { data } = await query
    setTopics((data ?? []) as unknown as DailyTopic[])
    setLoading(false)
  }, [supabase, filter])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/daily-topics', { method: 'POST' })
      const data = await res.json()
      alert(`Refreshed: ${data.message}`)
      fetchTopics()
    } catch (err) {
      alert('Error refreshing topics')
    }
    setRefreshing(false)
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from('daily_topics').update({ is_active: !isActive }).eq('id', id)
    setTopics(prev => prev.map(t => t.id === id ? { ...t, is_active: !isActive } : t))
  }

  const togglePinned = async (id: string, isPinned: boolean) => {
    await supabase.from('daily_topics').update({ is_pinned: !isPinned }).eq('id', id)
    setTopics(prev => prev.map(t => t.id === id ? { ...t, is_pinned: !isPinned } : t))
  }

  const deleteTopic = async (id: string) => {
    if (!confirm('Delete this topic?')) return
    await supabase.from('daily_topic_politicians').delete().eq('topic_id', id)
    await supabase.from('daily_topics').delete().eq('id', id)
    setTopics(prev => prev.filter(t => t.id !== id))
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Daily Topics</h1>
          <p className="mt-1 text-sm text-[var(--poli-sub)]">
            Manage daily news headlines shown on the homepage
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? 'Fetching...' : 'Fetch New Topics'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {(['active', 'inactive', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-[var(--poli-text)] text-[var(--poli-bg)]'
                : 'bg-[var(--poli-hover)] text-[var(--poli-sub)] hover:text-[var(--poli-text)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[var(--poli-faint)]">Loading...</div>
      ) : topics.length === 0 ? (
        <div className="rounded-xl border border-[var(--poli-border)] py-12 text-center">
          <div className="text-sm text-[var(--poli-faint)]">No topics found</div>
          <button
            onClick={handleRefresh}
            className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Fetch topics from GNews
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map(topic => (
            <div
              key={topic.id}
              className={`rounded-xl border p-4 transition-all ${
                topic.is_active
                  ? 'border-[var(--poli-border)]'
                  : 'border-[var(--poli-border)] opacity-50'
              } ${topic.is_pinned ? 'border-amber-500/30 bg-amber-500/5' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Tags */}
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {topic.is_pinned && (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                        Pinned
                      </span>
                    )}
                    {topic.issues && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                        {(topic.issues as unknown as { name: string }).name}
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--poli-faint)]">
                      {timeAgo(topic.published_at)}
                    </span>
                    {topic.source_name && (
                      <span className="text-[10px] text-[var(--poli-faint)]">
                        via {topic.source_name}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="text-[14px] font-semibold text-[var(--poli-text)]">
                    {topic.title}
                  </div>

                  {/* Summary */}
                  {topic.summary && (
                    <div className="mt-1 text-[12px] leading-relaxed text-[var(--poli-sub)]">
                      {topic.summary}
                    </div>
                  )}

                  {/* Politicians */}
                  {topic.daily_topic_politicians.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {topic.daily_topic_politicians.map(tp => {
                        const pol = tp.politicians as unknown as { name: string; slug: string; party: string }
                        return (
                          <Link
                            key={tp.politician_id}
                            href={`/politicians/${pol.slug}`}
                            className="rounded-full bg-[var(--poli-hover)] px-2 py-0.5 text-[11px] font-medium text-[var(--poli-text)] no-underline hover:bg-[var(--poli-badge-bg)]"
                          >
                            {pol.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => togglePinned(topic.id, topic.is_pinned)}
                    className={`rounded px-2 py-1 text-[11px] transition-colors ${
                      topic.is_pinned
                        ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                        : 'bg-[var(--poli-hover)] text-[var(--poli-faint)] hover:text-amber-400'
                    }`}
                    title={topic.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    {topic.is_pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => toggleActive(topic.id, topic.is_active)}
                    className="rounded bg-[var(--poli-hover)] px-2 py-1 text-[11px] text-[var(--poli-faint)] transition-colors hover:text-[var(--poli-text)]"
                  >
                    {topic.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="rounded bg-[var(--poli-hover)] px-2 py-1 text-[11px] text-red-400/60 transition-colors hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
