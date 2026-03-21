import { getPartyDefault } from '@/lib/utils/alignment'
import { partyLabel } from '@/lib/constants/parties'
import { stanceStyle } from '@/lib/utils/stances'

interface StanceDeviationProps {
  party: string
  stances: Array<{
    stance: string
    issues?: { slug: string; name: string; icon?: string } | null
  }>
}

/**
 * Shows stances where this politician breaks from their party line.
 * These are the most interesting / differentiating data points.
 */
export function StanceDeviation({ party, stances }: StanceDeviationProps) {
  const deviations = stances
    .filter((s) => {
      if (!s.issues?.slug) return false
      const expected = getPartyDefault(party, s.issues.slug)
      return expected !== null && s.stance !== expected
    })
    .map((s) => ({
      ...s,
      expected: getPartyDefault(party, s.issues!.slug)!,
    }))

  if (deviations.length === 0) return null

  const label = partyLabel(party)

  return (
    <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
      <h2 className="mb-1 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
        Breaks from {label} Line
      </h2>
      <p className="mb-4 text-[11px] text-[var(--codex-faint)]">
        Issues where this official diverges from the typical {label} position
      </p>
      <div className="grid gap-2">
        {deviations.map((d) => {
          const expectedColors = stanceStyle(d.expected).color
          const actualColor = stanceStyle(d.stance).color

          return (
            <div
              key={d.issues!.slug}
              className="flex items-center justify-between rounded-md border border-[var(--codex-border)] px-4 py-2.5"
            >
              <span className="text-[13px] text-[var(--codex-text)]">
                {d.issues!.name}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] uppercase tracking-[0.06em] line-through opacity-40"
                  style={{ color: expectedColors }}
                >
                  {stanceStyle(d.expected).shortLabel}
                </span>
                <span className="text-[11px] text-[var(--codex-faint)]">→</span>
                <span
                  className="rounded-sm px-1.5 py-0.5 text-[11px] uppercase tracking-[0.06em]"
                  style={{ color: actualColor, background: `${actualColor}18` }}
                >
                  {stanceStyle(d.stance).shortLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
