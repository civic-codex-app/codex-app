import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { computeAlignment, alignmentMeta } from '@/lib/utils/alignment'
import { stanceBucket, stanceStyle } from '@/lib/utils/stances'
import { StanceScale } from '@/components/compare/stance-scale'
import { BackgroundComparison } from '@/components/compare/background-comparison'
import { FinanceComparison } from '@/components/compare/finance-comparison'
import { VotingOverlap } from '@/components/compare/voting-overlap'
import { ElectionComparison } from '@/components/compare/election-comparison'

interface CompareViewProps {
  polA: any
  polB: any
  stancesA: any[]
  stancesB: any[]
  committeesA: any[]
  committeesB: any[]
  financeA: any[]
  financeB: any[]
  votingA: any[]
  votingB: any[]
  electionsA: any[]
  electionsB: any[]
}

export function CompareView({
  polA,
  polB,
  stancesA,
  stancesB,
  committeesA,
  committeesB,
  financeA,
  financeB,
  votingA,
  votingB,
  electionsA,
  electionsB,
}: CompareViewProps) {
  const colorA = partyColor(polA.party)
  const colorB = partyColor(polB.party)

  const alignA = computeAlignment(polA.party, stancesA)
  const alignB = computeAlignment(polB.party, stancesB)
  const metaA = alignA >= 0 ? alignmentMeta(alignA, polA.party) : null
  const metaB = alignB >= 0 ? alignmentMeta(alignB, polB.party) : null

  // Build a unified issue list from both sets of stances
  const issueMap = new Map<string, { name: string; slug: string; icon?: string; a?: string; b?: string }>()
  for (const s of stancesA) {
    if (s.issues?.slug) {
      issueMap.set(s.issues.slug, {
        name: s.issues.name,
        slug: s.issues.slug,
        icon: s.issues.icon,
        a: s.stance,
      })
    }
  }
  for (const s of stancesB) {
    if (s.issues?.slug) {
      const existing = issueMap.get(s.issues.slug)
      if (existing) {
        existing.b = s.stance
      } else {
        issueMap.set(s.issues.slug, {
          name: s.issues.name,
          slug: s.issues.slug,
          icon: s.issues.icon,
          b: s.stance,
        })
      }
    }
  }
  const allIssues = Array.from(issueMap.values())

  // Filter out issues where BOTH are unknown
  const comparableIssues = allIssues.filter(issue => {
    const bucketA = stanceBucket(issue.a ?? 'unknown')
    const bucketB = stanceBucket(issue.b ?? 'unknown')
    return bucketA !== 'unknown' || bucketB !== 'unknown'
  })

  // Count agreements / disagreements
  let agree = 0
  let disagree = 0
  for (const issue of comparableIssues) {
    const bucketA = stanceBucket(issue.a ?? 'unknown')
    const bucketB = stanceBucket(issue.b ?? 'unknown')
    if (bucketA === 'unknown' || bucketB === 'unknown') continue
    if (bucketA === bucketB) agree++
    else disagree++
  }
  const total = agree + disagree
  const agreePct = total > 0 ? Math.round((agree / total) * 100) : 0

  // Shared committees
  const cmSlugsA = new Set(committeesA.map((c: any) => c.committees?.slug).filter(Boolean))
  const sharedCommittees = committeesB.filter((c: any) => cmSlugsA.has(c.committees?.slug))

  return (
    <div className="animate-fade-up">
      {/* Profile cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <ProfileCard pol={polA} color={colorA} alignment={alignA} meta={metaA} stances={stancesA} />
        <ProfileCard pol={polB} color={colorB} alignment={alignB} meta={metaB} stances={stancesB} />
      </div>

      {/* Agreement meter */}
      {total > 0 && (
        <div className="mb-8 rounded-md border border-[var(--codex-border)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--codex-sub)]">
              Issue Agreement
            </span>
            <span className="text-xl font-semibold">
              {agreePct}%
            </span>
          </div>
          <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-[var(--codex-border)]">
            <div
              className="rounded-l-full transition-all"
              style={{
                width: `${agreePct}%`,
                background: 'linear-gradient(90deg, #3B82F688, #3B82F6)',
              }}
            />
            <div
              className="rounded-r-full transition-all"
              style={{
                width: `${100 - agreePct}%`,
                background: 'linear-gradient(90deg, #EF4444, #EF444488)',
              }}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-blue-400/70">{agree} agree</span>
            <span className="text-red-400/70">{disagree} disagree</span>
          </div>
        </div>
      )}

      {/* Stance Scale (replaces radar + issue table) */}
      {comparableIssues.length > 0 && (
        <StanceScale
          issues={comparableIssues}
          polA={{ name: polA.name, party: polA.party }}
          polB={{ name: polB.name, party: polB.party }}
        />
      )}

      {/* No comparable stances */}
      {comparableIssues.length === 0 && (
        <div className="mb-8 rounded-md border border-[var(--codex-border)] px-6 py-10 text-center">
          <div className="mb-2 text-lg font-semibold text-[var(--codex-faint)]">No stance data to compare</div>
          <p className="text-[13px] text-[var(--codex-faint)]">
            Neither official has verified stances on record yet.
          </p>
        </div>
      )}

      {/* Background */}
      <BackgroundComparison polA={polA} polB={polB} />

      {/* Campaign Finance */}
      <FinanceComparison financeA={financeA} financeB={financeB} polA={polA} polB={polB} />

      {/* Voting Record Overlap */}
      <VotingOverlap votingA={votingA} votingB={votingB} polA={polA} polB={polB} />

      {/* Election History */}
      <ElectionComparison electionsA={electionsA} electionsB={electionsB} polA={polA} polB={polB} />

      {/* Shared committees */}
      {sharedCommittees.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
            Shared Committees
          </h2>
          <div className="grid gap-2">
            {sharedCommittees.map((cm: any, i: number) => (
              <div
                key={i}
                className="rounded-md border border-[var(--codex-border)] px-4 py-2.5 text-[13px] text-[var(--codex-text)]"
              >
                {cm.committees?.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileCard({
  pol,
  color,
  alignment,
  meta,
  stances,
}: {
  pol: any
  color: string
  alignment: number
  meta: ReturnType<typeof alignmentMeta> | null
  stances: any[]
}) {
  const supports = stances.filter((s: any) => ['strongly_supports', 'supports', 'leans_support'].includes(s.stance)).length
  const opposes = stances.filter((s: any) => ['strongly_opposes', 'opposes', 'leans_oppose'].includes(s.stance)).length
  const mixed = stances.filter((s: any) => ['mixed', 'neutral'].includes(s.stance)).length
  const total = supports + opposes + mixed

  return (
    <div className="rounded-md border border-[var(--codex-border)] p-4 sm:p-5">
      <div className="mb-4 h-1 w-full rounded-full" style={{ background: `${color}44` }}>
        <div
          className="h-full rounded-full"
          style={{ width: alignment >= 0 ? `${alignment}%` : '100%', background: color }}
        />
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div
          className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--codex-card)] sm:h-14 sm:w-14"
          style={{ border: `2px solid ${color}66` }}
        >
          <AvatarImage
            src={pol.image_url}
            alt={pol.name}
            size={56}
            fallbackColor={color}
            party={pol.party}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <Link
            href={`/politicians/${pol.slug}`}
            className="block truncate text-base font-semibold leading-tight hover:underline sm:text-lg"
          >
            {pol.name}
          </Link>
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-[var(--codex-sub)] sm:gap-1.5">
            <PartyIcon party={pol.party} size={10} />
            <span className="text-[var(--codex-faint)]">·</span>
            <span>{pol.state}</span>
            <span className="hidden text-[var(--codex-faint)] sm:inline">·</span>
            <span className="hidden sm:inline">{CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
            Alignment
          </div>
          {alignment >= 0 ? (
            <div className="text-lg font-semibold" style={{ color }}>
              {alignment}%
            </div>
          ) : (
            <div className="text-lg font-semibold text-[var(--codex-faint)]">—</div>
          )}
        </div>

        <div>
          <div className="mb-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
            Stances
          </div>
          {total > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-[12px] tabular-nums text-blue-400">{supports}</span>
              <span className="text-[11px] text-[var(--codex-faint)]">/</span>
              <span className="text-[12px] tabular-nums text-purple-400">{mixed}</span>
              <span className="text-[11px] text-[var(--codex-faint)]">/</span>
              <span className="text-[12px] tabular-nums text-red-400">{opposes}</span>
            </div>
          ) : (
            <div className="text-lg font-semibold text-[var(--codex-faint)]">—</div>
          )}
        </div>

        <div className="hidden sm:block">
          <div className="mb-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
            Type
          </div>
          {meta ? (
            <span
              className="rounded-sm px-1.5 py-0.5 text-[11px] uppercase tracking-[0.06em]"
              style={{ color: meta.color, background: meta.bgColor }}
            >
              {meta.label}
            </span>
          ) : (
            <div className="text-[var(--codex-faint)]">—</div>
          )}
        </div>
      </div>

      {total > 0 && (
        <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
          {supports > 0 && (
            <div style={{ width: `${(supports / total) * 100}%`, background: '#3B82F6', opacity: 0.6 }} />
          )}
          {mixed > 0 && (
            <div style={{ width: `${(mixed / total) * 100}%`, background: '#A855F7', opacity: 0.6 }} />
          )}
          {opposes > 0 && (
            <div style={{ width: `${(opposes / total) * 100}%`, background: '#EF4444', opacity: 0.6 }} />
          )}
        </div>
      )}
    </div>
  )
}
