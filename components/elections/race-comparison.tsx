import Link from 'next/link'
import { IssueIcon } from '@/components/icons/issue-icon'
import { stanceStyle, stanceBucket, stanceDisplayBadge } from '@/lib/utils/stances'
import { partyColor } from '@/lib/constants/parties'

interface Candidate {
  id: string
  name: string
  party: string
  politician?: { id: string; slug: string } | null
}

interface StanceData {
  issueSlug: string
  issueName: string
  issueIcon?: string
  stances: Record<string, string> // candidateId -> stance
}

interface RaceComparisonProps {
  candidates: Candidate[]
  stancesByCandidate: Map<string, Array<{ stance: string; issues: { slug: string; name: string; icon?: string } }>>
}

export function RaceComparison({ candidates, stancesByCandidate }: RaceComparisonProps) {
  if (candidates.length < 2) return null

  // Build unified issue list across all candidates
  const issueMap = new Map<string, StanceData>()
  for (const candidate of candidates) {
    const stances = stancesByCandidate.get(candidate.id) ?? []
    for (const s of stances) {
      if (!s.issues?.slug) continue
      let entry = issueMap.get(s.issues.slug)
      if (!entry) {
        entry = {
          issueSlug: s.issues.slug,
          issueName: s.issues.name,
          issueIcon: s.issues.icon,
          stances: {},
        }
        issueMap.set(s.issues.slug, entry)
      }
      entry.stances[candidate.id] = s.stance
    }
  }

  const issues = Array.from(issueMap.values()).filter((issue) => {
    // Only show issues where at least 2 candidates have a non-unknown stance
    const knownCount = Object.values(issue.stances).filter(
      (s) => stanceBucket(s) !== 'unknown'
    ).length
    return knownCount >= 2
  })

  if (issues.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
        Candidate Issue Comparison
      </h2>

      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Header row with candidate names */}
          <div
            className="mb-2 grid items-end gap-2 px-4 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]"
            style={{
              gridTemplateColumns: `1fr ${candidates.map(() => '100px').join(' ')}`,
            }}
          >
            <span>Issue</span>
            {candidates.map((c) => (
              <span key={c.id} className="text-center">
                {c.name.split(' ').pop()}
              </span>
            ))}
          </div>

          {/* Issue rows */}
          <div className="space-y-1">
            {issues.map((issue) => {
              // Check if all known stances agree
              const knownStances = candidates
                .map((c) => issue.stances[c.id])
                .filter((s) => s && stanceBucket(s) !== 'unknown')
                .map((s) => stanceBucket(s))
              const allAgree =
                knownStances.length >= 2 &&
                knownStances.every((b) => b === knownStances[0])

              return (
                <div
                  key={issue.issueSlug}
                  className="grid items-center gap-2 rounded-md px-4 py-2.5"
                  style={{
                    gridTemplateColumns: `1fr ${candidates.map(() => '100px').join(' ')}`,
                    background: allAgree ? '#3B82F608' : undefined,
                    border: `1px solid ${allAgree ? '#3B82F618' : 'var(--codex-border)'}`,
                  }}
                >
                  <Link
                    href={`/issues/${issue.issueSlug}`}
                    className="flex items-center gap-2 text-[13px] font-medium text-[var(--codex-text)] hover:underline"
                  >
                    {issue.issueIcon && (
                      <IssueIcon
                        icon={issue.issueIcon}
                        size={14}
                        className="text-[var(--codex-sub)]"
                      />
                    )}
                    <span className="truncate">{issue.issueName}</span>
                  </Link>

                  {candidates.map((c) => {
                    const stance = issue.stances[c.id]
                    if (!stance || stanceBucket(stance) === 'unknown') {
                      return (
                        <div key={c.id} className="text-center text-[11px] text-[var(--codex-faint)]">
                          —
                        </div>
                      )
                    }
                    const badge = stanceDisplayBadge(stance, c.party)
                    return (
                      <div key={c.id} className="flex justify-center">
                        <span
                          className={`rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Compare link for 2-candidate races with politician profiles */}
      {candidates.length === 2 &&
        candidates[0].politician?.slug &&
        candidates[1].politician?.slug && (
          <div className="mt-4 text-center">
            <Link
              href={`/compare?a=${candidates[0].politician.slug}&b=${candidates[1].politician.slug}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--codex-border)] px-4 py-2 text-[12px] text-[var(--codex-sub)] transition-colors hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
            >
              Full Comparison →
            </Link>
          </div>
        )}
    </div>
  )
}
