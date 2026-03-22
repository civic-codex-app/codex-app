'use client'

import { useState, useEffect } from 'react'

interface Annotation {
  id: string
  annotation_type: 'correction' | 'source' | 'context'
  content: string
  source_url: string | null
  created_at: string
  issue_id: string | null
  profiles: { display_name: string | null } | null
  issues: { name: string; slug: string } | null
}

interface AnnotationListProps {
  politicianId: string
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  correction: {
    label: 'Correction',
    className: 'bg-red-500/10 text-red-400',
  },
  source: {
    label: 'Source',
    className: 'bg-blue-500/10 text-blue-400',
  },
  context: {
    label: 'Context',
    className: 'bg-amber-500/10 text-amber-400',
  },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AnnotationList({ politicianId }: AnnotationListProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/annotations?politicianId=${politicianId}`)
        if (res.ok) {
          const data = await res.json()
          setAnnotations(data.annotations ?? [])
        }
      } catch {
        // Silently fail — annotations are supplementary
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [politicianId])

  if (loading) return null
  if (annotations.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[var(--codex-sub)]">Community Annotations</h3>

      <div className="space-y-2">
        {annotations.map((a) => {
          const badge = TYPE_BADGES[a.annotation_type] ?? TYPE_BADGES.context
          const displayName = a.profiles?.display_name || 'Anonymous'

          return (
            <div
              key={a.id}
              className="rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-3 space-y-1.5"
            >
              {/* Header: badge + user + date */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
                {a.issues && (
                  <span className="text-[11px] text-[var(--codex-faint)]">
                    on {a.issues.name}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-[var(--codex-faint)]">
                  {displayName} &middot; {formatDate(a.created_at)}
                </span>
              </div>

              {/* Content */}
              <p className="text-sm text-[var(--codex-text)] leading-relaxed">{a.content}</p>

              {/* Source link */}
              {a.source_url && (
                <a
                  href={a.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)] underline underline-offset-2"
                >
                  <SourceIcon />
                  View source
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SourceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
