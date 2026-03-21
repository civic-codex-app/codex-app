import Link from 'next/link'
import Image from 'next/image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { computeAlignment, alignmentMeta } from '@/lib/utils/alignment'
import { IssueIcon } from '@/components/icons/issue-icon'

interface CompareViewProps {
  polA: any
  polB: any
  stancesA: any[]
  stancesB: any[]
  committeesA: any[]
  committeesB: any[]
}

const STANCE_COLORS: Record<string, { color: string; label: string }> = {
  supports: { color: '#22C55E', label: 'Supports' },
  opposes: { color: '#EF4444', label: 'Opposes' },
  mixed: { color: '#EAB308', label: 'Mixed' },
  unknown: { color: '#6B7280', label: 'Unknown' },
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
  const issues = Array.from(issueMap.values())

  // Count agreements / disagreements
  let agree = 0
  let disagree = 0
  for (const issue of issues) {
    if (issue.a && issue.b) {
      if (issue.a === issue.b) agree++
      else disagree++
    }
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
      <div className="mb-8">
        <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
          Issue-by-Issue Comparison
        </h2>
        <div className="space-y-1">
          {/* Header row */}
          <div className="hidden gap-2 px-4 pb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)] sm:grid sm:grid-cols-[1fr_100px_100px]">
            <span>Issue</span>
            <span className="text-center">{polA.name.split(' ').pop()}</span>
            <span className="text-center">{polB.name.split(' ').pop()}</span>
          </div>
          {issues.map((issue) => {
            const scA = STANCE_COLORS[issue.a ?? 'unknown'] ?? STANCE_COLORS.unknown
            const scB = STANCE_COLORS[issue.b ?? 'unknown'] ?? STANCE_COLORS.unknown
            const match = issue.a && issue.b && issue.a === issue.b

            return (
              <div
                key={issue.slug}
                className="rounded-md px-4 py-2.5 sm:grid sm:grid-cols-[1fr_100px_100px] sm:items-center sm:gap-2"
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
                      style={{ color: scA.color, background: `${scA.color}18` }}
                    >
                      {scA.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--codex-faint)] sm:hidden">vs</span>
                  <div className="flex sm:justify-center">
                    <span
                      className="rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.06em]"
                      style={{ color: scB.color, background: `${scB.color}18` }}
                    >
                      {scB.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
          {pol.image_url ? (
            <Image
              src={pol.image_url}
              alt={pol.name}
              width={48}
              height={48}
              unoptimized
              className="h-full w-full object-cover"
              style={{ filter: 'grayscale(20%)' }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-lg text-[var(--codex-faint)] sm:text-xl">
              {pol.name.charAt(0)}
            </div>
          )}
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

        {/* Label — hidden on mobile to prevent cramming */}
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
