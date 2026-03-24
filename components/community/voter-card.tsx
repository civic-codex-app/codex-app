'use client'

import Link from 'next/link'
import { stanceBucket } from '@/lib/utils/stances'
import { STATE_NAMES } from '@/lib/constants/us-states'
import { StanceAvatar } from './stance-avatar'

interface VoterCardProps {
  anonymousId: string
  state?: string | null
  stances: Record<string, string>
  issues: Array<{ slug: string; name: string }>
}

export function VoterCard({ anonymousId, state, stances, issues }: VoterCardProps) {
  const displayId = anonymousId.slice(0, 4).toUpperCase()
  const entries = Object.entries(stances)
  const total = entries.length

  // Count stance buckets
  const counts = { supports: 0, opposes: 0, neutral: 0, mixed: 0, unknown: 0 }
  for (const [, stance] of entries) {
    const bucket = stanceBucket(stance)
    counts[bucket]++
  }

  // Top 3 stances (strongest positions)
  const issueMap = new Map(issues.map((i) => [i.slug, i.name]))
  const topStances = entries
    .filter(([, s]) => s.startsWith('strongly_'))
    .slice(0, 3)
    .map(([slug, stance]) => ({
      name: issueMap.get(slug) ?? slug,
      bucket: stanceBucket(stance),
    }))

  const stateName = state ? STATE_NAMES[state as keyof typeof STATE_NAMES] ?? state : null

  return (
    <div className="rounded-lg border border-[var(--codex-border)] p-4 transition-all hover:border-[var(--codex-input-border)] hover:bg-[var(--codex-hover)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <StanceAvatar supports={counts.supports} opposes={counts.opposes} neutral={counts.neutral + counts.mixed + counts.unknown} total={total} size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[var(--codex-text)]">
            Voter #{displayId}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--codex-faint)]">
            {stateName && <span>{stateName}</span>}
            <span>{total} issues answered</span>
          </div>
        </div>
      </div>

      {/* Stance distribution bar */}
      {total > 0 && (
        <div className="mb-3">
          <div className="flex h-2 overflow-hidden rounded-full">
            {counts.supports > 0 && (
              <div
                className="bg-blue-500"
                style={{ width: `${(counts.supports / total) * 100}%` }}
              />
            )}
            {counts.neutral > 0 && (
              <div
                className="bg-gray-400"
                style={{ width: `${(counts.neutral / total) * 100}%` }}
              />
            )}
            {counts.mixed > 0 && (
              <div
                className="bg-yellow-500"
                style={{ width: `${(counts.mixed / total) * 100}%` }}
              />
            )}
            {counts.opposes > 0 && (
              <div
                className="bg-red-500"
                style={{ width: `${(counts.opposes / total) * 100}%` }}
              />
            )}
          </div>
          <div className="mt-1.5 flex gap-3 text-[10px] text-[var(--codex-faint)]">
            {counts.supports > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                {counts.supports} support
              </span>
            )}
            {counts.opposes > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                {counts.opposes} oppose
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top stances */}
      {topStances.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {topStances.map((s) => (
            <span
              key={s.name}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor:
                  s.bucket === 'supports' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                color: s.bucket === 'supports' ? '#60a5fa' : '#f87171',
              }}
            >
              {s.bucket === 'supports' ? 'For' : 'Against'} {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Compare button */}
      <Link
        href={`/compare/users?them=${anonymousId}`}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--codex-border)] px-3 py-2 text-[12px] font-medium text-[var(--codex-sub)] no-underline transition-colors hover:border-blue-500/50 hover:text-blue-400"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Compare with me
      </Link>
    </div>
  )
}

