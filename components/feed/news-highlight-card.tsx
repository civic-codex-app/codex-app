'use client'

import { BIAS_GROUP_COLORS, type BiasGroup } from '@/lib/data/media-bias'
import type { NewsArticle } from '@/lib/utils/news'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

interface Props {
  articles: NewsArticle[]
  label?: string
}

export function NewsHighlightCard({ articles, label = 'Trending in Politics' }: Props) {
  if (!articles.length) return null

  return (
    <div className="rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--codex-sub)]">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
        </svg>
        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
          {label}
        </span>
      </div>

      <div className="space-y-3">
        {articles.slice(0, 10).map((a, i) => {
          const colors = BIAS_GROUP_COLORS[a.biasGroup]
          return (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg p-2 no-underline transition-colors hover:bg-[var(--codex-hover)]"
            >
              <span
                className="mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: colors.dot }}
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] font-medium leading-[1.4] text-[var(--codex-text)] group-hover:text-blue-400">
                  {a.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--codex-faint)]">
                  <span>{a.source}</span>
                  <span>&middot;</span>
                  <span suppressHydrationWarning>{timeAgo(a.publishedAt)}</span>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
