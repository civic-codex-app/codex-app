import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { computeAlignment, alignmentMeta } from '@/lib/utils/alignment'
import { IssueIcon } from '@/components/icons/issue-icon'
import { stanceBucket, stanceStyle } from '@/lib/utils/stances'

interface CompareViewProps {
  polA: any
  polB: any
  stancesA: any[]
  stancesB: any[]
  committeesA: any[]
  committeesB: any[]
}

export function CompareView({
  polA,
  polB,
  stancesA,
  stancesB,
  committeesA,
  committeesB,
}: CompareViewProps) {
  const colorA = partyColor(polA.party)
  const colorB = partyColor(polB.party)

  const alignA = computeAlignment(polA.party, stancesA)
  const alignB = computeAlignment(polB.party, stancesB)
  const metaA = alignA >= 0 ? alignmentMeta(alignA) : null
  const metaB = alignB >= 0 ? alignmentMeta(alignB) : null

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

  // Filter out issues where BOTH are unknown — not meaningful to compare
  const comparableIssues = allIssues.filter(issue => {
    const bucketA = stanceBucket(issue.a ?? 'unknown')
    const bucketB = stanceBucket(issue.b ?? 'unknown')
    // Keep if at least one side has a known stance
    return bucketA !== 'unknown' || bucketB !== 'unknown'
  })

  // Count agreements / disagreements using buckets (not raw stance values)
  let agree = 0
  let disagree = 0
  for (const issue of comparableIssues) {
    const bucketA = stanceBucket(issue.a ?? 'unknown')
    const bucketB = stanceBucket(issue.b ?? 'unknown')
    // Skip if either is unknown — can't compare
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
      {/* Header cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <ProfileCard pol={polA} color={colorA} alignment={alignA} meta={metaA} stances={stancesA} />
        <ProfileCard pol={polB} color={colorB} alignment={alignB} meta={metaB} stances={stancesB} />
      </div>

      {/* Agreement meter */}
      {total > 0 && (
        <div className="mb-8 rounded-md border border-[var(--codex-border)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
              Issue Agreement
            </span>
            <span className="font-serif text-xl">
              {agreePct}%
            </span>
          </div>
          <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-[var(--codex-border)]">
            <div
              className="rounded-l-full transition-all"
              style={{
                width: `${agreePct}%`,
                background: 'linear-gradient(90deg, #22C55E88, #22C55E)',
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
            <span className="text-green-400/70">{agree} agree</span>
            <span className="text-red-400/70">{disagree} disagree</span>
          </div>
        </div>
      )}

      {/* Issue-by-issue comparison */}
      {comparableIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
            Issue-by-Issue Comparison
          </h2>
          <div className="space-y-1">
            {/* Header row */}
            <div className="hidden gap-2 px-4 pb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)] sm:grid sm:grid-cols-[1fr_120px_120px]">
              <span>Issue</span>
              <span className="text-center">{polA.name.split(' ').pop()}</span>
              <span className="text-center">{polB.name.split(' ').pop()}</span>
            </div>
            {comparableIssues.map((issue) => {
              const styleA = stanceStyle(issue.a ?? 'unknown')
              const styleB = stanceStyle(issue.b ?? 'unknown')
              const bucketA = stanceBucket(issue.a ?? 'unknown')
              const bucketB = stanceBucket(issue.b ?? 'unknown')
              const match = bucketA !== 'unknown' && bucketB !== 'unknown' && bucketA === bucketB

              return (
                <div
                  key={issue.slug}
                  className="rounded-md px-4 py-2.5 sm:grid sm:grid-cols-[1fr_120px_120px] sm:items-center sm:gap-2"
                  style={{
                    background: match ? '#22C55E08' : undefined,
                    border: `1px solid ${match ? '#22C55E18' : 'var(--codex-border)'}`,
                  }}
                >
                  <Link
                    href={`/issues/${issue.slug}`}
                    className="flex items-center gap-2 text-[13px] font-medium hover:text-[var(--codex-text)]"
                  >
                    {issue.icon && (
                      <IssueIcon icon={issue.icon} size={14} className="text-[var(--codex-sub)]" />
                    )}
                    {issue.name}
                  </Link>
                  <div className="mt-2 flex items-center gap-3 sm:mt-0 sm:contents">
                    <div className="flex sm:justify-center">
                      <span
                        className="rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.06em]"
                        style={{ color: styleA.color, background: `${styleA.color}18` }}
                      >
                        {styleA.shortLabel || styleA.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--codex-faint)] sm:hidden">vs</span>
                    <div className="flex sm:justify-center">
                      <span
                        className="rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.06em]"
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
      )}

      {/* No comparable stances */}
      {comparableIssues.length === 0 && (
        <div className="mb-8 rounded-md border border-[var(--codex-border)] px-6 py-10 text-center">
          <div className="mb-2 font-serif text-lg text-[var(--codex-faint)]">No stance data to compare</div>
          <p className="text-[13px] text-[var(--codex-faint)]">
            Neither official has verified stances on record yet.
          </p>
        </div>
      )}

      {/* Shared committees */}
      {sharedCommittees.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
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
      {/* Top color accent */}
      <div className="mb-4 h-1 w-full rounded-full" style={{ background: `${color}44` }}>
        <div
          className="h-full rounded-full"
          style={{ width: alignment >= 0 ? `${alignment}%` : '100%', background: color }}
        />
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div
          className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[var(--codex-card)] sm:h-14 sm:w-14"
          style={{ border: `2px solid ${color}66` }}
        >
          <AvatarImage
            src={pol.image_url}
            alt={pol.name}
            size={56}
            fallbackColor={color}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <Link
            href={`/politicians/${pol.slug}`}
            className="block truncate font-serif text-base leading-tight hover:underline sm:text-lg"
          >
            {pol.name}
          </Link>
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-[var(--codex-sub)] sm:gap-1.5">
            <PartyIcon party={pol.party} size={10} />
            <span style={{ color }}>{partyLabel(pol.party)}</span>
            <span className="text-[var(--codex-faint)]">·</span>
            <span>{pol.state}</span>
            <span className="hidden text-[var(--codex-faint)] sm:inline">·</span>
            <span className="hidden sm:inline">{CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Alignment */}
        <div>
          <div className="mb-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
            Alignment
          </div>
          {alignment >= 0 ? (
            <div className="font-serif text-lg" style={{ color }}>
              {alignment}%
            </div>
          ) : (
            <div className="font-serif text-lg text-[var(--codex-faint)]">—</div>
          )}
        </div>

        {/* Stance breakdown */}
        <div>
          <div className="mb-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
            Stances
          </div>
          {total > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-[12px] tabular-nums text-green-400">{supports}</span>
              <span className="text-[11px] text-[var(--codex-faint)]">/</span>
              <span className="text-[12px] tabular-nums text-yellow-400">{mixed}</span>
              <span className="text-[11px] text-[var(--codex-faint)]">/</span>
              <span className="text-[12px] tabular-nums text-red-400">{opposes}</span>
            </div>
          ) : (
            <div className="font-serif text-lg text-[var(--codex-faint)]">—</div>
          )}
        </div>

        {/* Label */}
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

      {/* Mini stance bar */}
      {total > 0 && (
        <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
          {supports > 0 && (
            <div style={{ width: `${(supports / total) * 100}%`, background: '#22C55E', opacity: 0.6 }} />
          )}
          {mixed > 0 && (
            <div style={{ width: `${(mixed / total) * 100}%`, background: '#EAB308', opacity: 0.6 }} />
          )}
          {opposes > 0 && (
            <div style={{ width: `${(opposes / total) * 100}%`, background: '#EF4444', opacity: 0.6 }} />
          )}
        </div>
      )}
    </div>
  )
}
