'use client'

import Link from 'next/link'
import { IssueIcon } from '@/components/icons/issue-icon'
import { STANCE_NUMERIC, stanceStyle, stanceBucket } from '@/lib/utils/stances'
import { partyColor } from '@/lib/constants/parties'

interface StanceScaleProps {
  issues: Array<{ slug: string; name: string; icon?: string; a?: string; b?: string }>
  polA: { name: string; party: string }
  polB: { name: string; party: string }
}

export function StanceScale({ issues, polA, polB }: StanceScaleProps) {
  const colorA = partyColor(polA.party)
  const colorB = partyColor(polB.party)

  return (
    <div>
      <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
        Stance Comparison
      </h2>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-[11px] text-[var(--codex-sub)]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: colorA }} />
          <span>{polA.name.split(' ').pop()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: colorB }} />
          <span>{polB.name.split(' ').pop()}</span>
        </div>
      </div>

      <div className="space-y-1">
        {issues.map((issue) => {
          const numA = STANCE_NUMERIC[issue.a ?? 'unknown'] ?? -1
          const numB = STANCE_NUMERIC[issue.b ?? 'unknown'] ?? -1
          const styleA = stanceStyle(issue.a ?? 'unknown')
          const styleB = stanceStyle(issue.b ?? 'unknown')
          const bucketA = stanceBucket(issue.a ?? 'unknown')
          const bucketB = stanceBucket(issue.b ?? 'unknown')
          const match =
            bucketA !== 'unknown' && bucketB !== 'unknown' && bucketA === bucketB

          const posA = numA >= 0 ? (numA / 6) * 100 : -1
          const posB = numB >= 0 ? (numB / 6) * 100 : -1

          return (
            <div
              key={issue.slug}
              className="rounded-md px-4 py-3"
              style={{
                background: match ? '#22C55E08' : undefined,
                border: `1px solid ${match ? '#22C55E18' : 'var(--codex-border)'}`,
              }}
            >
              {/* Issue name */}
              <Link
                href={`/issues/${issue.slug}`}
                className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[var(--codex-text)] hover:underline"
              >
                {issue.icon && (
                  <IssueIcon icon={issue.icon} size={14} className="text-[var(--codex-sub)]" />
                )}
                {issue.name}
              </Link>

              {/* Scale track */}
              <div className="relative mx-1 h-4">
                {/* Track background */}
                <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[var(--codex-border)]" />

                {/* 7 tick marks */}
                {[0, 1, 2, 3, 4, 5, 6].map((tick) => (
                  <div
                    key={tick}
                    className="absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-[var(--codex-faint)]"
                    style={{ left: `${(tick / 6) * 100}%`, opacity: 0.4 }}
                  />
                ))}

                {/* Dot A */}
                {posA >= 0 ? (
                  <div
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--codex-card)]"
                    style={{ left: `${posA}%`, background: colorA, zIndex: 2 }}
                  />
                ) : null}

                {/* Dot B */}
                {posB >= 0 ? (
                  <div
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--codex-card)]"
                    style={{ left: `${posB}%`, background: colorB, zIndex: 2 }}
                  />
                ) : null}
              </div>

              {/* Labels row */}
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span style={{ color: colorA }}>
                  {posA >= 0 ? styleA.shortLabel : '—'}
                </span>
                <span style={{ color: colorB }}>
                  {posB >= 0 ? styleB.shortLabel : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Scale axis labels */}
      <div className="mt-2 flex justify-between px-5 text-[10px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">
        <span>Strongly Opposes</span>
        <span>Strongly Supports</span>
      </div>
    </div>
  )
}
