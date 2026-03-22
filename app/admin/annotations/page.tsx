'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Annotation = {
  id: string
  annotation_type: 'correction' | 'source' | 'context'
  content: string
  source_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string
  politician_id: string
  issue_id: string | null
  profiles: { display_name: string | null; email: string } | null
  politicians: { name: string; slug: string } | null
  issues: { name: string } | null
}

const TYPE_COLORS: Record<string, string> = {
  correction: '#dc2626',
  source: '#2563eb',
  context: '#d97706',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#d97706',
  approved: '#16a34a',
  rejected: '#dc2626',
}

export default function AdminAnnotationsPage() {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchAnnotations = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('annotations')
      .select('*, profiles(display_name, email), politicians(name, slug), issues(name)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setAnnotations((data as any) ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchAnnotations()
  }, [fetchAnnotations])

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id)
    await supabase.from('annotations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setUpdating(null)
  }

  const pendingCount = annotations.filter(a => a.status === 'pending').length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--codex-text)]">Community Annotations</h1>
          <p className="mt-1 text-sm text-[var(--codex-sub)]">
            Review user-submitted corrections, sources, and context
          </p>
        </div>
        {filter === 'pending' && pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-[var(--codex-text)] text-[var(--codex-card)]'
                : 'border border-[var(--codex-border)] text-[var(--codex-sub)] hover:bg-[var(--codex-hover)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[var(--codex-faint)]">Loading...</div>
      ) : annotations.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--codex-faint)]">
          No {filter === 'all' ? '' : filter} annotations
        </div>
      ) : (
        <div className="space-y-3">
          {annotations.map(a => (
            <div
              key={a.id}
              className="rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {/* Type badge */}
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: TYPE_COLORS[a.annotation_type] }}
                >
                  {a.annotation_type}
                </span>
                {/* Status badge */}
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: STATUS_COLORS[a.status] }}
                >
                  {a.status}
                </span>
                {/* Politician */}
                {a.politicians && (
                  <a
                    href={`/politicians/${a.politicians.slug}`}
                    className="text-sm font-medium text-[var(--codex-text)] hover:underline"
                  >
                    {a.politicians.name}
                  </a>
                )}
                {/* Issue */}
                {a.issues && (
                  <span className="text-xs text-[var(--codex-faint)]">
                    on {a.issues.name}
                  </span>
                )}
              </div>

              {/* Content */}
              <p className="mb-2 text-sm text-[var(--codex-text)]">{a.content}</p>

              {/* Source URL */}
              {a.source_url && (
                <a
                  href={a.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-2 block text-xs text-blue-500 hover:underline"
                >
                  {a.source_url}
                </a>
              )}

              {/* Meta + actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--codex-faint)]">
                  by {a.profiles?.display_name || a.profiles?.email || 'Unknown'} &middot;{' '}
                  {new Date(a.created_at).toLocaleDateString()}
                </span>

                {a.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(a.id, 'approved')}
                      disabled={updating === a.id}
                      className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(a.id, 'rejected')}
                      disabled={updating === a.id}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
