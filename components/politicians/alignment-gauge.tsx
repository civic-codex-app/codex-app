'use client'

import { partyColor, partyLabel } from '@/lib/constants/parties'
import { alignmentMeta } from '@/lib/utils/alignment'

interface AlignmentGaugeProps {
  score: number // 0-100
  party: string
}

export function AlignmentGauge({ score, party }: AlignmentGaugeProps) {
  if (score < 0) return null

  const meta = alignmentMeta(score)
  const color = partyColor(party)

  return (
    <div className="rounded-md border border-[var(--codex-border)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
          Party Alignment
        </span>
        <span
          className="rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em]"
          style={{ color: meta.color, background: meta.bgColor }}
        >
          {meta.label}
        </span>
      </div>

      {/* Gauge bar */}
      <div className="relative mb-2">
        <div className="h-2 overflow-hidden rounded-full bg-[var(--codex-border)]">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
            }}
          />
        </div>

        {/* Tick marks at 25, 50, 75 */}
        <div className="absolute inset-0 flex items-center justify-between px-[25%]">
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="h-2 w-px bg-[var(--codex-bg)]"
              style={{ opacity: 0.4 }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold" style={{ color }}>
          {score}%
        </span>
        <span className="text-[11px] text-[var(--codex-faint)]">
          aligned with {partyLabel(party)} positions
        </span>
      </div>
    </div>
  )
}
