'use client'

import Link from 'next/link'
import { IssueIcon } from '@/components/icons/issue-icon'
import { stanceStyle, stanceBucket } from '@/lib/utils/stances'
import { ISSUE_SUBTITLES } from '@/lib/data/educational-content'

interface StanceScaleProps {
  issues: Array<{ slug: string; name: string; icon?: string; a?: string; b?: string }>
  polA: { name: string; party: string }
  polB: { name: string; party: string }
}

export function StanceScale({ issues, polA, polB }: StanceScaleProps) {
  const lastA = polA.name.split(' ').pop()
  const lastB = polB.name.split(' ').pop()

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
        Issue Positions
      </h2>

      <div className="space-y-1">
        {/* Header row */}
        <div className="hidden gap-2 px-4 pb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)] sm:grid sm:grid-cols-[1fr_140px_140px]">
          <span>Issue</span>
          <span className="text-center">{lastA}</span>
          <span className="text-center">{lastB}</span>
        </div>

        {issues.map((issue) => {
          const styleA = stanceStyle(issue.a ?? 'unknown')
          const styleB = stanceStyle(issue.b ?? 'unknown')
          const bucketA = stanceBucket(issue.a ?? 'unknown')
          const bucketB = stanceBucket(issue.b ?? 'unknown')
          const match = bucketA !== 'unknown' && bucketB !== 'unknown' && bucketA === bucketB

          return (
            <div
              key={issue.slug}
              className="rounded-md px-4 py-3 sm:grid sm:grid-cols-[1fr_140px_140px] sm:items-center sm:gap-2"
              style={{
                background: match ? '#3B82F608' : undefined,
                border: `1px solid ${match ? '#3B82F618' : 'var(--codex-border)'}`,
              }}
            >
              {/* Issue name */}
              <div>
                <Link
                  href={`/issues/${issue.slug}`}
                  className="flex items-center gap-2 text-[13px] font-medium text-[var(--codex-text)] hover:underline"
                >
                  {issue.icon && (
                    <IssueIcon icon={issue.icon} size={14} className="text-[var(--codex-sub)]" />
                  )}
                  {issue.name}
                </Link>
                {ISSUE_SUBTITLES[issue.slug] && (
                  <p className="mt-0.5 text-[11px] leading-[1.4] text-[var(--codex-faint)]">{ISSUE_SUBTITLES[issue.slug]}</p>
                )}
              </div>

              {/* Stance badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0 sm:contents">
                <div className="flex items-center gap-1.5 sm:justify-center">
                  <span className="text-[10px] text-[var(--codex-faint)] sm:hidden">{lastA}:</span>
                  <span
                    className="rounded-sm px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em]"
                    style={{ color: styleA.color, background: `${styleA.color}18` }}
                  >
                    {styleA.shortLabel || styleA.label}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--codex-faint)] sm:hidden">vs</span>
                <div className="flex items-center gap-1.5 sm:justify-center">
                  <span className="text-[10px] text-[var(--codex-faint)] sm:hidden">{lastB}:</span>
                  <span
                    className="rounded-sm px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em]"
                    style={{ color: styleB.color, background: `${styleB.color}18` }}
                  >
                    {styleB.shortLabel || styleB.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
