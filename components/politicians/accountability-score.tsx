import Link from 'next/link'
import { stanceStyle, stanceDisplayBadge } from '@/lib/utils/stances'
import { matchBillToIssues, doesVoteAlignWithStance } from '@/lib/utils/bill-issue-map'

interface Vote {
  bill_name: string
  bill_number?: string
  vote: string
}

interface Stance {
  stance: string
  issues?: { slug: string; name: string } | null
}

interface AccountabilityScoreProps {
  votes: Vote[]
  stances: Stance[]
  party?: string
}

interface Contradiction {
  billName: string
  billNumber?: string
  vote: string
  issueName: string
  stance: string
}

export function AccountabilityScore({ votes, stances, party }: AccountabilityScoreProps) {
  // Build stance map: issueSlug -> { stance, issueName }
  const stanceMap = new Map<string, { stance: string; name: string }>()
  for (const s of stances) {
    if (s.issues?.slug) {
      stanceMap.set(s.issues.slug, { stance: s.stance, name: s.issues.name })
    }
  }

  let aligned = 0
  let contradictions: Contradiction[] = []
  let total = 0

  for (const vote of votes) {
    if (!vote.bill_name) continue
    const matchedIssues = matchBillToIssues(vote.bill_name)

    for (const issueSlug of matchedIssues) {
      const stanceData = stanceMap.get(issueSlug)
      if (!stanceData) continue

      const result = doesVoteAlignWithStance(vote.vote, stanceData.stance)
      if (result === 'skip') continue

      total++
      if (result === 'aligned') {
        aligned++
      } else {
        contradictions.push({
          billName: vote.bill_name,
          billNumber: vote.bill_number,
          vote: vote.vote,
          issueName: stanceData.name,
          stance: stanceData.stance,
        })
      }
    }
  }

  if (total === 0) return null

  const alignPct = Math.round((aligned / total) * 100)
  const color = alignPct >= 80 ? '#3B82F6' : alignPct >= 60 ? '#60A5FA' : alignPct >= 40 ? '#A855F7' : '#EF4444'

  // Deduplicate contradictions by bill name
  const seen = new Set<string>()
  const uniqueContradictions = contradictions.filter(c => {
    if (seen.has(c.billName)) return false
    seen.add(c.billName)
    return true
  })

  return (
    <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
      <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
        Votes vs. Stances
      </h2>

      <div className="rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
        {/* Score */}
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="var(--codex-border)" strokeWidth="4" />
              <circle
                cx="30" cy="30" r="25" fill="none" stroke={color} strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 25}
                strokeDashoffset={(1 - alignPct / 100) * 2 * Math.PI * 25}
                transform="rotate(-90 30 30)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold font-bold" style={{ color }}>{alignPct}%</span>
            </div>
          </div>
          <div>
            <div className="text-[13px] font-medium text-[var(--codex-text)]">
              {alignPct >= 80 ? 'Walks the talk' : alignPct >= 60 ? 'Mostly consistent' : alignPct >= 40 ? 'Some contradictions' : 'Frequently contradicts'}
            </div>
            <div className="text-[11px] text-[var(--codex-faint)]">
              {aligned} of {total} votes match stated positions
            </div>
          </div>
        </div>

        {/* Contradictions */}
        {uniqueContradictions.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--codex-faint)]">
              Notable Contradictions
            </h3>
            <div className="space-y-1.5">
              {uniqueContradictions.slice(0, 5).map((c, i) => {
                const badge = stanceDisplayBadge(c.stance, party)
                return (
                  <div key={i} className="rounded-md border border-[var(--codex-border)] px-3 py-2 text-[12px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[var(--codex-text)]">
                        {c.billNumber && c.billNumber !== c.billName ? `${c.billName} (${c.billNumber})` : c.billName}
                      </span>
                      <span
                        className="flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase"
                        style={{
                          color: c.vote === 'yea' ? '#22C55E' : '#EF4444',
                          background: c.vote === 'yea' ? '#22C55E18' : '#EF444418',
                        }}
                      >
                        Voted {c.vote}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--codex-faint)]">
                      <span>Stance on {c.issueName}:</span>
                      <span
                        className="rounded-sm px-1.5 py-0.5 text-[10px] uppercase border"
                        style={badge.style}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
