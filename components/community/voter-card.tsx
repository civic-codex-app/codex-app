'use client'

import Link from 'next/link'
import { stanceBucket, STANCE_NUMERIC } from '@/lib/utils/stances'
import { STATE_NAMES } from '@/lib/constants/us-states'
import { StanceAvatar } from './stance-avatar'
import { computeAlignment, alignmentMeta } from '@/lib/utils/alignment'

interface VoterCardProps {
  anonymousId: string
  state?: string | null
  stances: Record<string, string>
  issues: Array<{ slug: string; name: string }>
  myStances?: Record<string, string> | null
}

export function VoterCard({ anonymousId, state, stances, issues, myStances }: VoterCardProps) {
  const displayId = anonymousId.slice(0, 4).toUpperCase()
  const entries = Object.entries(stances)
  const total = entries.length

  // Count stance buckets
  const counts = { supports: 0, opposes: 0, neutral: 0, mixed: 0, unknown: 0 }
  for (const [, stance] of entries) {
    const bucket = stanceBucket(stance)
    counts[bucket]++
  }

  // Show a balanced mix of stances — pick from both sides if available
  const issueMap = new Map(issues.map((i) => [i.slug, i.name]))
  const strong = entries
    .filter(([, s]) => s.startsWith('strongly_'))
    .map(([slug, stance]) => ({
      name: issueMap.get(slug) ?? slug,
      bucket: stanceBucket(stance),
    }))

  const supportTags = strong.filter((s) => s.bucket === 'supports')
  const opposeTags = strong.filter((s) => s.bucket === 'opposes')

  // Balanced: if both sides exist, take up to 2 from each (max 4)
  // If only one side, take up to 3
  let topStances: typeof strong
  if (supportTags.length > 0 && opposeTags.length > 0) {
    const perSide = Math.min(2, Math.max(supportTags.length, opposeTags.length))
    topStances = [
      ...supportTags.slice(0, perSide),
      ...opposeTags.slice(0, perSide),
    ].slice(0, 4)
  } else {
    topStances = strong.slice(0, 3)
  }

  const stateName = state ? STATE_NAMES[state as keyof typeof STATE_NAMES] ?? state : null

  // Compute alignment with both parties
  const stanceArray = entries.map(([slug, stance]) => ({ stance, issues: { slug } }))
  const demAlign = computeAlignment('democrat', stanceArray)
  const repAlign = computeAlignment('republican', stanceArray)
  const leanLabel = Math.abs(demAlign - repAlign) < 5
    ? 'Centrist'
    : demAlign > repAlign
      ? 'Leans Left'
      : 'Leans Right'
  const leanColor = Math.abs(demAlign - repAlign) < 5
    ? 'var(--poli-faint)'
    : demAlign > repAlign
      ? '#60a5fa'
      : '#f87171'

  // Compute match with current viewer
  let matchPct: number | null = null
  if (myStances && Object.keys(myStances).length > 0) {
    const sharedSlugs = entries.filter(([slug]) => slug in myStances).map(([slug]) => slug)
    if (sharedSlugs.length > 0) {
      let totalDist = 0
      for (const slug of sharedSlugs) {
        const a = STANCE_NUMERIC[stances[slug] as keyof typeof STANCE_NUMERIC] ?? 3
        const b = STANCE_NUMERIC[myStances[slug] as keyof typeof STANCE_NUMERIC] ?? 3
        totalDist += Math.abs(a - b)
      }
      const maxDist = sharedSlugs.length * 6
      matchPct = Math.round((1 - totalDist / maxDist) * 100)
    }
  }

  return (
    <div className="rounded-lg border border-[var(--poli-border)] p-4 transition-all hover:border-[var(--poli-input-border)] hover:bg-[var(--poli-hover)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <StanceAvatar supports={counts.supports} opposes={counts.opposes} neutral={counts.neutral + counts.mixed + counts.unknown} total={total} size={40} seed={anonymousId} />
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[var(--poli-text)]">
            Voter #{displayId}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--poli-faint)]">
            {stateName && <span>{stateName}</span>}
            <span>{total} issues answered</span>
            <span style={{ color: leanColor }}>{leanLabel}</span>
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
          <div className="mt-1.5 flex gap-3 text-[10px] text-[var(--poli-faint)]">
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
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Match % + Compare button */}
      {matchPct !== null && (
        <div className="mb-2 flex items-center justify-between text-[11px]">
          <span className="text-[var(--poli-faint)]">Match with you</span>
          <span
            className="font-semibold"
            style={{
              color: matchPct >= 70 ? '#34d399' : matchPct >= 40 ? '#fbbf24' : '#f87171',
            }}
          >
            {matchPct}%
          </span>
        </div>
      )}
      <Link
        href={`/compare/users?them=${anonymousId}`}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--poli-border)] px-3 py-2 text-[12px] font-medium text-[var(--poli-sub)] no-underline transition-colors hover:border-blue-500/50 hover:text-blue-400"
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

