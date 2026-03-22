import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor } from '@/lib/constants/parties'
import { STANCE_NUMERIC } from '@/lib/utils/stances'

interface CompareSuggestionsProps {
  politicianId: string
  slug: string
  state: string
  chamber: string
  party: string
  stances: Array<{
    issue_id: string
    stance: string
    issues?: { slug: string } | null
  }>
}

interface Suggestion {
  id: string
  name: string
  slug: string
  party: string
  state: string
  image_url: string | null
  reason: string
  reasonLabel: string
}

/**
 * Compute a numeric distance score between two politicians' stances.
 * Lower = more similar. Uses STANCE_NUMERIC (0-6 scale).
 * Returns { distance, sharedIssues } or null if not enough overlap.
 */
function stanceDistance(
  stanceMapA: Map<string, number>,
  stanceMapB: Map<string, number>
): { distance: number; sharedIssues: number } | null {
  let totalDist = 0
  let shared = 0

  for (const [issueId, valA] of stanceMapA) {
    const valB = stanceMapB.get(issueId)
    if (valB == null || valA < 0 || valB < 0) continue
    shared++
    totalDist += Math.abs(valA - valB)
  }

  if (shared < 3) return null
  return { distance: totalDist / shared, sharedIssues: shared }
}

export async function CompareSuggestions({
  politicianId,
  slug,
  state,
  chamber,
  party,
  stances,
}: CompareSuggestionsProps) {
  // Build numeric stance map for current politician
  const myStanceMap = new Map<string, number>()
  for (const s of stances) {
    const val = STANCE_NUMERIC[s.stance]
    if (val != null) myStanceMap.set(s.issue_id, val)
  }

  if (myStanceMap.size < 3) return null

  const supabase = createServiceRoleClient()
  const suggestions: Suggestion[] = []

  // ── 1. State rival: same state, opposite party ──
  const oppositeParty = party === 'democrat' ? 'republican' : party === 'republican' ? 'democrat' : null

  if (oppositeParty) {
    const { data: rivals } = await supabase
      .from('politicians')
      .select('id, name, slug, party, state, image_url')
      .eq('state', state)
      .eq('party', oppositeParty)
      .neq('id', politicianId)
      .limit(1)

    if (rivals && rivals.length > 0) {
      const r = rivals[0]
      suggestions.push({
        id: r.id,
        name: r.name,
        slug: r.slug,
        party: r.party,
        state: r.state,
        image_url: r.image_url,
        reason: 'state-rival',
        reasonLabel: 'State Rival',
      })
    }
  }

  // ── 2 & 3. Fetch stances for same-chamber politicians of different party ──
  const usedIds = new Set([politicianId, ...suggestions.map(s => s.id)])

  // Get same-chamber politicians (different party) — limit to a reasonable set
  const { data: chamberPols } = await supabase
    .from('politicians')
    .select('id')
    .eq('chamber', chamber)
    .neq('party', party)
    .neq('id', politicianId)
    .limit(200)

  if (chamberPols && chamberPols.length > 0) {
    const chamberIds = chamberPols.map(p => p.id)

    // Fetch all stances for these politicians (paginate for 1000-row limit)
    const allStances: Array<{ politician_id: string; issue_id: string; stance: string }> = []
    const PAGE = 1000
    for (let from = 0; ; from += PAGE) {
      const { data: batch } = await supabase
        .from('politician_issues')
        .select('politician_id, issue_id, stance')
        .in('politician_id', chamberIds)
        .range(from, from + PAGE - 1)

      if (!batch || batch.length === 0) break
      allStances.push(...batch)
      if (batch.length < PAGE) break
    }

    // Build per-politician numeric stance maps
    const polStanceMaps = new Map<string, Map<string, number>>()
    for (const row of allStances) {
      const val = STANCE_NUMERIC[row.stance]
      if (val == null) continue
      if (!polStanceMaps.has(row.politician_id)) {
        polStanceMaps.set(row.politician_id, new Map())
      }
      polStanceMaps.get(row.politician_id)!.set(row.issue_id, val)
    }

    // Score each politician
    const scored: Array<{ id: string; avgDist: number; shared: number }> = []
    for (const [pid, sMap] of polStanceMaps) {
      const result = stanceDistance(myStanceMap, sMap)
      if (!result) continue
      scored.push({ id: pid, avgDist: result.distance, shared: result.sharedIssues })
    }

    // ── 2. Ideological opposite: highest distance ──
    scored.sort((a, b) => b.avgDist - a.avgDist)
    const opposite = scored.find(s => !usedIds.has(s.id))
    if (opposite) {
      usedIds.add(opposite.id)
    }

    // ── 3. Surprising ally: lowest distance (most similar, different party) ──
    scored.sort((a, b) => a.avgDist - b.avgDist)
    const ally = scored.find(s => !usedIds.has(s.id))
    if (ally) {
      usedIds.add(ally.id)
    }

    // Fetch politician details for the two picks
    const pickIds = [opposite?.id, ally?.id].filter(Boolean) as string[]
    if (pickIds.length > 0) {
      const { data: pickPols } = await supabase
        .from('politicians')
        .select('id, name, slug, party, state, image_url')
        .in('id', pickIds)

      if (pickPols) {
        const polMap = new Map(pickPols.map(p => [p.id, p]))

        if (opposite) {
          const p = polMap.get(opposite.id)
          if (p) {
            suggestions.push({
              id: p.id,
              name: p.name,
              slug: p.slug,
              party: p.party,
              state: p.state,
              image_url: p.image_url,
              reason: 'ideological-opposite',
              reasonLabel: 'Ideological Opposite',
            })
          }
        }

        if (ally) {
          const p = polMap.get(ally.id)
          if (p) {
            suggestions.push({
              id: p.id,
              name: p.name,
              slug: p.slug,
              party: p.party,
              state: p.state,
              image_url: p.image_url,
              reason: 'surprising-ally',
              reasonLabel: 'Surprising Ally',
            })
          }
        }
      }
    }
  }

  if (suggestions.length === 0) return null

  return (
    <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
      <h2 className="mb-1 text-sm font-semibold text-[var(--codex-sub)]">
        Smart Compare
      </h2>
      <p className="mb-4 text-[11px] text-[var(--codex-faint)]">
        See how stances compare side-by-side
      </p>

      <div className="space-y-2">
        {suggestions.map((s) => {
          const color = partyColor(s.party)
          const reasonColors: Record<string, { bg: string; text: string }> = {
            'state-rival': { bg: '#EF444418', text: '#EF4444' },
            'ideological-opposite': { bg: '#F9731618', text: '#F97316' },
            'surprising-ally': { bg: '#22C55E18', text: '#22C55E' },
          }
          const rc = reasonColors[s.reason] ?? { bg: 'var(--codex-badge-bg)', text: 'var(--codex-faint)' }

          return (
            <Link
              key={s.id}
              href={`/compare?a=${slug}&b=${s.slug}`}
              className="flex items-center gap-3 rounded-lg border border-[var(--codex-border)] px-4 py-3 no-underline transition-all hover:border-[var(--codex-input-focus)] hover:bg-[var(--codex-hover)]"
            >
              {/* Avatar */}
              <div
                className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full"
                style={{ border: `2px solid ${color}44` }}
              >
                <AvatarImage
                  src={s.image_url}
                  alt={s.name}
                  size={36}
                  fallbackColor={color}
                  party={s.party}
                />
              </div>

              {/* Name + info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-[13px] font-medium text-[var(--codex-text)]">
                    {s.name}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--codex-faint)]">
                  {s.state}
                </div>
              </div>

              {/* Reason label */}
              <span
                className="flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.04em]"
                style={{ color: rc.text, backgroundColor: rc.bg }}
              >
                {s.reasonLabel}
              </span>

              {/* Arrow */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--codex-faint)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
