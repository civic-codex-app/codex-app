'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  type BiasGroup,
  BIAS_GROUP_LABELS,
  BIAS_GROUP_COLORS,
} from '@/lib/data/media-bias'
import type { NewsArticle } from '@/lib/utils/news'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const GROUPS: BiasGroup[] = ['left', 'center', 'right', 'unknown']

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface InTheNewsProps {
  articles: NewsArticle[]
  politicianName: string
  party?: string
}

export function InTheNews({ articles, politicianName, party }: InTheNewsProps) {
  const [activeGroup, setActiveGroup] = useState<BiasGroup | 'all'>('all')

  if (!articles.length) return null

  // Order columns: show the "home team" perspective first
  // Republicans see right first, Democrats see left first
  const isConservative = party === 'republican'
  const orderedGroups: BiasGroup[] = isConservative
    ? ['right', 'center', 'left', 'unknown']
    : ['left', 'center', 'right', 'unknown']

  // Group articles
  const grouped: Record<BiasGroup, NewsArticle[]> = {
    left: [],
    center: [],
    right: [],
    unknown: [],
  }
  for (const a of articles) {
    grouped[a.biasGroup].push(a)
  }

  const visibleArticles =
    activeGroup === 'all'
      ? articles
      : grouped[activeGroup] ?? []

  return (
    <div>
      {/* Perspective filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveGroup('all')}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all',
            activeGroup === 'all'
              ? 'bg-[var(--codex-text)] text-[var(--codex-bg)]'
              : 'bg-[var(--codex-badge-bg)] text-[var(--codex-sub)] hover:bg-[var(--codex-hover)]'
          )}
        >
          All ({articles.length})
        </button>
        {orderedGroups.map((g) => {
          const count = grouped[g].length
          if (count === 0) return null
          const colors = BIAS_GROUP_COLORS[g]
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all',
                activeGroup === g
                  ? 'text-[var(--codex-bg)]'
                  : 'bg-[var(--codex-badge-bg)] text-[var(--codex-sub)] hover:bg-[var(--codex-hover)]'
              )}
              style={
                activeGroup === g
                  ? { backgroundColor: colors.dot, color: '#fff' }
                  : undefined
              }
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: colors.dot }}
              />
              {BIAS_GROUP_LABELS[g]} ({count})
            </button>
          )
        })}
      </div>

      {/* Articles */}
      {activeGroup === 'all' ? (
        /* Column layout — balanced by fetcher (5 per group) */
        <div className={cn(
          'grid gap-4',
          grouped.unknown.length > 0 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
        )}>
          {orderedGroups.map((g) => {
            const items = grouped[g]
            if (items.length === 0) return null
            const colors = BIAS_GROUP_COLORS[g]
            return (
              <div key={g}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: colors.dot }}
                  />
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
                    {BIAS_GROUP_LABELS[g]}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((a, i) => (
                    <ArticleCard key={i} article={a} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Single column filtered view */
        <div className="space-y-2">
          {visibleArticles.length > 0 ? (
            visibleArticles.map((a, i) => <ArticleCard key={i} article={a} />)
          ) : (
            <p className="py-8 text-center text-[13px] text-[var(--codex-faint)]">
              No articles from {BIAS_GROUP_LABELS[activeGroup as BiasGroup]} sources
            </p>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-5 text-[11px] leading-[1.5] text-[var(--codex-faint)]">
        Media bias ratings are approximate, based on AllSides methodology.
        Poli does not endorse any news source. Showing recent coverage only.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Article Card                                                       */
/* ------------------------------------------------------------------ */

function ArticleCard({ article }: { article: NewsArticle }) {
  const colors = BIAS_GROUP_COLORS[article.biasGroup]

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-[var(--codex-border)] p-3 no-underline transition-all hover:border-[var(--codex-input-border)] hover:bg-[var(--codex-hover)]"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: colors.dot }}
        />
        <span className="text-[11px] font-medium text-[var(--codex-sub)]">
          {article.source || article.sourceDomain}
        </span>
        <span className="ml-auto text-[10px] text-[var(--codex-faint)]">
          {timeAgo(article.publishedAt)}
        </span>
      </div>
      <p className="line-clamp-2 text-[13px] font-medium leading-[1.4] text-[var(--codex-text)] group-hover:text-blue-400">
        {article.title}
      </p>
    </a>
  )
}
