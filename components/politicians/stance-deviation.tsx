import { getPartyDefault } from '@/lib/utils/alignment'
import { partyLabel } from '@/lib/constants/parties'
import { stanceStyle, stanceBucket } from '@/lib/utils/stances'

interface StanceDeviationProps {
  party: string
  stances: Array<{
    stance: string
    issues?: { slug: string; name: string; icon?: string } | null
  }>
}

/**
 * Shows stances where this politician breaks from their party line.
 * Only shows true directional breaks — not just intensity differences.
 * e.g., "supports" vs party default "opposes" = a break
 *        "strongly_supports" vs party default "supports" = NOT a break (same direction)
 */
export function StanceDeviation({ party, stances }: StanceDeviationProps) {
  const deviations = stances
    .filter((s) => {
      if (!s.issues?.slug) return false
      const expected = getPartyDefault(party, s.issues.slug)
      if (!expected) return false
      if (s.stance === expected) return false

      // Only count as a break if the DIRECTION differs (supports vs opposes)
      // Same direction but different intensity is not a break
      const actualBucket = stanceBucket(s.stance)
      const expectedBucket = stanceBucket(expected)

      // Skip unknowns
      if (actualBucket === 'unknown' || expectedBucket === 'unknown') return false

      // Same bucket = not a real break
      if (actualBucket === expectedBucket) return false

      // Mixed/neutral vs supports/opposes = a meaningful break
      return true
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
        Issues where this official takes a different direction than the typical {label} position
      </p>
      <div className="grid gap-2">
        {deviations.map((d) => {
          const expectedStyle = stanceStyle(d.expected)
          const actualStyle = stanceStyle(d.stance)

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
                  style={{ color: expectedStyle.color }}
                >
                  {expectedStyle.shortLabel}
                </span>
                <span className="text-[11px] text-[var(--codex-faint)]">→</span>
                <span
                  className="rounded-sm px-1.5 py-0.5 text-[11px] uppercase tracking-[0.06em]"
                  style={{ color: actualStyle.color, background: `${actualStyle.color}18` }}
                >
                  {actualStyle.shortLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
