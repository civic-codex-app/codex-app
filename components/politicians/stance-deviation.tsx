import { getPartyDefault } from '@/lib/utils/alignment'
import { partyLabel } from '@/lib/constants/parties'
import { stanceStyle, stanceBucket, stanceDisplayBadge } from '@/lib/utils/stances'

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

      // A "break" means taking a meaningfully different direction:
      // - supports ↔ opposes = major break
      // - supports/opposes ↔ neutral/mixed = notable break (they're uncommitted where party has a position)
      // NOT a break: same direction, different intensity (supports vs strongly_supports)
      const actualBucket = stanceBucket(s.stance)
      const expectedBucket = stanceBucket(expected)

      // Skip unknowns
      if (actualBucket === 'unknown' || expectedBucket === 'unknown') return false

      // Same bucket = not a break
      if (actualBucket === expectedBucket) return false

      // Both neutral/mixed = not a break
      const neutralish = (b: string) => b === 'neutral' || b === 'mixed'
      if (neutralish(actualBucket) && neutralish(expectedBucket)) return false

      // Everything else is a real break
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
      <h2 className="mb-1 text-sm font-semibold text-[var(--codex-sub)]">
        Breaks from {label} Line
      </h2>
      <p className="mb-4 text-[11px] text-[var(--codex-faint)]">
        Issues where this official takes a different direction than the typical {label} position
      </p>
      <div className="grid gap-2">
        {deviations.map((d) => {
          const expectedBadge = stanceDisplayBadge(d.expected, party)
          const actualBadge = stanceDisplayBadge(d.stance, party)

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
                  style={{ color: expectedBadge.color }}
                >
                  {expectedBadge.label}
                </span>
                <span className="text-[11px] text-[var(--codex-faint)]">→</span>
                <span
                  className={`rounded-sm px-1.5 py-0.5 text-[11px] uppercase tracking-[0.06em] ${actualBadge.className}`}
                >
                  {actualBadge.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
