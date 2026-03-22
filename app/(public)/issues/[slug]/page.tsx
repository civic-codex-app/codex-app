import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { IssueIcon } from '@/components/icons/issue-icon'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { stanceBucket, STANCE_STYLES } from '@/lib/utils/stances'
import type { IssueRow, IssueStanceWithPoliticianRow } from '@/lib/types/supabase'
import { ISSUE_EXPLAINERS } from '@/lib/data/educational-content'
import { StanceGroup, type StanceEntry } from '@/components/issues/stance-group'

export const revalidate = 600 // 10 minutes

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ party?: string; chamber?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from('issues').select('name, description').eq('slug', slug).single()
  if (error) console.error('Failed to fetch issue metadata:', error.message)
  if (!data) return { title: 'Not Found -- Poli' }

  const description = data.description?.slice(0, 160) || `Track where U.S. politicians stand on ${data.name}`
  const ogUrl = `/api/og?title=${encodeURIComponent(data.name)}&subtitle=${encodeURIComponent('Political Stances')}&type=issue`

  return {
    title: `${data.name} | Poli Issues`,
    description,
    openGraph: {
      title: `${data.name} - Political Stances`,
      description,
      url: `https://getpoli.com/issues/${slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} - Political Stances`,
      images: [ogUrl],
    },
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Economy',
  healthcare: 'Healthcare',
  immigration: 'Immigration',
  education: 'Education',
  defense: 'Defense',
  environment: 'Environment',
  justice: 'Justice',
  foreign_policy: 'Foreign Policy',
  technology: 'Technology',
  social: 'Social',
  gun_policy: 'Gun Policy',
  infrastructure: 'Infrastructure',
  housing: 'Housing',
  energy: 'Energy',
}

/** Fetch all rows with pagination to bypass Supabase 1000-row limit */
async function fetchAllStances(supabase: ReturnType<typeof createServiceRoleClient>, issueId: string) {
  const PAGE = 1000
  let all: IssueStanceWithPoliticianRow[] = []
  let from = 0
  let done = false
  while (!done) {
    const { data, error } = await supabase
      .from('politician_issues')
      .select('*, politicians:politician_id!inner(id, name, slug, party, chamber, state, title, image_url)')
      .eq('issue_id', issueId)
      .order('stance')
      .order('id')
      .range(from, from + PAGE - 1)
    if (error) {
      console.error('Failed to fetch stances:', error.message)
      break
    }
    const rows = (data ?? []) as any as IssueStanceWithPoliticianRow[]
    all = all.concat(rows)
    if (rows.length < PAGE) done = true
    else from += PAGE
  }
  return all
}

/** Patterns that indicate a generic/boilerplate summary */
const GENERIC_PATTERNS = [
  /^supports?\s+(this\s+)?issue/i,
  /^opposes?\s+(this\s+)?issue/i,
  /^has\s+(a\s+)?(mixed|neutral|unknown)\s+(stance|position)/i,
  /^no\s+(known\s+)?(stance|position)/i,
  /^position\s+(is\s+)?(unclear|unknown)/i,
  /supports?\s+key\s+aspects?\s+of/i,
  /opposes?\s+key\s+aspects?\s+of/i,
  /generally\s+(supports?|opposes?|favors?)/i,
  /estimated\s+position/i,
  /based\s+on\s+party/i,
  /^\w+\s+\w+\s+supports?\s+key\s+aspects/i, // "[Name] supports key aspects"
  /^\w+\s+\w+\s+opposes?\s+key\s+aspects/i,
  /^\w+\s+\w+\s+has\s+(a\s+)?(mixed|neutral)/i,
  /^\w+\s+\w+\s+generally\s+(supports?|opposes?)/i,
]

function isGenericSummary(summary: string | null): boolean {
  if (!summary || summary.trim().length === 0) return true
  if (summary.trim().length < 20) return true
  // Also treat as generic if it's a very common summary seen many times
  return GENERIC_PATTERNS.some((p) => p.test(summary.trim()))
}

/**
 * Process stances into deduplicated entries grouped by bucket.
 * Politicians with identical summaries are collapsed into one entry.
 */
function buildStanceGroups(stances: IssueStanceWithPoliticianRow[]) {
  // Deduplicate by politician id
  const seenPol = new Set<string>()
  const deduped = stances.filter((s) => {
    const polId = s.politicians?.id
    if (!polId || seenPol.has(polId)) return false
    seenPol.add(polId)
    return true
  })

  const BUCKET_CONFIG = {
    supports: { label: 'Progressive', style: STANCE_STYLES.supports },
    mixed: { label: 'Centrist / Mixed', style: STANCE_STYLES.mixed },
    opposes: { label: 'Conservative', style: STANCE_STYLES.opposes },
    unknown: { label: 'Unknown', style: STANCE_STYLES.unknown },
  }

  // Group into buckets, merging neutral into mixed
  const buckets: Record<string, IssueStanceWithPoliticianRow[]> = {
    supports: [],
    mixed: [],
    opposes: [],
    unknown: [],
  }
  for (const s of deduped) {
    let bucket = stanceBucket(s.stance)
    if (bucket === 'neutral') bucket = 'mixed'
    buckets[bucket].push(s)
  }

  const result: Record<string, { entries: StanceEntry[]; totalCount: number; label: string; style: typeof STANCE_STYLES.supports }> = {}

  for (const [bucket, items] of Object.entries(buckets)) {
    if (items.length === 0) continue

    const config = BUCKET_CONFIG[bucket as keyof typeof BUCKET_CONFIG]

    // Group by normalized summary
    const summaryMap = new Map<string, StanceEntry>()
    const noSummaryPols: StanceEntry['politicians'] = []

    for (const s of items) {
      const pol = s.politicians!
      const polData = {
        id: pol.id,
        name: pol.name,
        slug: pol.slug,
        party: pol.party,
        chamber: pol.chamber,
        state: pol.state,
        title: pol.title,
        image_url: pol.image_url,
      }

      if (isGenericSummary(s.summary)) {
        noSummaryPols.push(polData)
      } else {
        // Normalize: lowercase, strip trailing punctuation, collapse whitespace,
        // remove common filler words to catch near-identical summaries
        const key = s.summary!.trim().toLowerCase()
          .replace(/[.,;:!?]+$/g, '')
          .replace(/\s+/g, ' ')
          .replace(/\b(the|a|an|of|and|in|on|for|to|is|has|with|their|this|that)\b/g, '')
          .replace(/\b(\w{4,})s\b/g, '$1')  // naive depluralize (5+ char words) to merge "protections"/"protection"
          .replace(/\s+/g, ' ')
          .trim()
        const existing = summaryMap.get(key)
        if (existing) {
          existing.politicians.push(polData)
        } else {
          summaryMap.set(key, { summary: s.summary!.trim(), politicians: [polData] })
        }
      }
    }

    // Unique summaries first (sorted by politician count desc), then no-summary group
    const entries: StanceEntry[] = Array.from(summaryMap.values())
      .sort((a, b) => b.politicians.length - a.politicians.length)

    if (noSummaryPols.length > 0) {
      entries.push({ summary: null, politicians: noSummaryPols })
    }

    result[bucket] = { entries, totalCount: items.length, label: config.label, style: config.style }
  }

  return result
}

export default async function IssuePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const supabase = createServiceRoleClient()

  const { data: issueData, error: issueError } = await supabase.from('issues').select('*').eq('slug', slug).single()
  if (issueError) console.error('Failed to fetch issue:', issueError.message)
  if (!issueData) notFound()

  const issue = issueData as any as IssueRow

  // Stance types grouped by bucket
  const supportStances = ['strongly_supports', 'supports', 'leans_support']
  const opposeStances = ['strongly_opposes', 'opposes', 'leans_oppose']

  function countQ(filters: { stance?: string[]; party?: string } = {}) {
    let q = filters.party
      ? supabase.from('politician_issues').select('id, politicians:politician_id!inner(id)', { count: 'exact', head: true }).eq('issue_id', issue.id).eq('politicians.party', filters.party)
      : supabase.from('politician_issues').select('id', { count: 'exact', head: true }).eq('issue_id', issue.id)
    if (filters.stance) q = q.in('stance', filters.stance)
    return q
  }

  const [totalRes, supportsRes, opposesRes, allStances,
    demTotalR, demSupR, demOppR,
    gopTotalR, gopSupR, gopOppR,
    indTotalR, indSupR, indOppR,
  ] = await Promise.all([
    countQ(),
    countQ({ stance: supportStances }),
    countQ({ stance: opposeStances }),
    fetchAllStances(supabase, issue.id),
    countQ({ party: 'democrat' }),
    countQ({ party: 'democrat', stance: supportStances }),
    countQ({ party: 'democrat', stance: opposeStances }),
    countQ({ party: 'republican' }),
    countQ({ party: 'republican', stance: supportStances }),
    countQ({ party: 'republican', stance: opposeStances }),
    countQ({ party: 'independent' }),
    countQ({ party: 'independent', stance: supportStances }),
    countQ({ party: 'independent', stance: opposeStances }),
  ])

  const totalAll = totalRes.count ?? 0
  const supportsAll = supportsRes.count ?? 0
  const opposesAll = opposesRes.count ?? 0
  const mixedAll = totalAll - supportsAll - opposesAll

  const partyStats: Record<string, { total: number; supports: number; opposes: number; mixed: number }> = {}
  const demTotal = demTotalR.count ?? 0
  if (demTotal > 0) partyStats.democrat = { total: demTotal, supports: demSupR.count ?? 0, opposes: demOppR.count ?? 0, mixed: demTotal - (demSupR.count ?? 0) - (demOppR.count ?? 0) }
  const gopTotal = gopTotalR.count ?? 0
  if (gopTotal > 0) partyStats.republican = { total: gopTotal, supports: gopSupR.count ?? 0, opposes: gopOppR.count ?? 0, mixed: gopTotal - (gopSupR.count ?? 0) - (gopOppR.count ?? 0) }
  const indTotal = indTotalR.count ?? 0
  if (indTotal > 0) partyStats.independent = { total: indTotal, supports: indSupR.count ?? 0, opposes: indOppR.count ?? 0, mixed: indTotal - (indSupR.count ?? 0) - (indOppR.count ?? 0) }

  // Build deduplicated stance groups
  const stanceGroups = buildStanceGroups(allStances)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${issue.name} - Political Stances`,
    description: issue.description || `Track where U.S. politicians stand on ${issue.name}`,
    url: `https://getpoli.com/issues/${slug}`,
    about: { '@type': 'Thing', name: issue.name, description: issue.description },
    isPartOf: { '@type': 'WebSite', name: 'Poli', url: 'https://getpoli.com' },
  }

  const bucketOrder = ['supports', 'mixed', 'opposes', 'unknown'] as const

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[800px] px-6 pt-6 md:px-10">
        <Link
          href="/issues"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
        >
          &larr; Back to issues
        </Link>

        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
            {CATEGORY_LABELS[issue.category] ?? issue.category}
          </span>
          <span className="text-[11px] text-[var(--codex-faint)]">
            {totalAll} politician{totalAll !== 1 ? 's' : ''}
          </span>
        </div>

        <h1 className="mb-3 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          {issue.icon && <IssueIcon icon={issue.icon} size={28} className="mr-1 inline-block text-[var(--codex-sub)]" />}
          {issue.name}
        </h1>

        {issue.description && (
          <p className="mb-6 text-[15px] leading-[1.7] text-[var(--codex-sub)]">{issue.description}</p>
        )}

        {/* What this means — educational explainer */}
        {ISSUE_EXPLAINERS[slug] && (
          <div className="mb-6 rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--codex-faint)]">
              What This Means
            </div>
            <p className="mb-3 text-[13px] leading-[1.6] text-[var(--codex-sub)]">
              {ISSUE_EXPLAINERS[slug].description}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-blue-500/5 px-3 py-2">
                <span className="text-[11px] font-medium text-blue-400">Progressive</span>
                <p className="mt-0.5 text-[12px] leading-[1.5] text-[var(--codex-sub)]">{ISSUE_EXPLAINERS[slug].progressiveView}</p>
              </div>
              <div className="rounded-md bg-red-500/5 px-3 py-2">
                <span className="text-[11px] font-medium text-red-400">Conservative</span>
                <p className="mt-0.5 text-[12px] leading-[1.5] text-[var(--codex-sub)]">{ISSUE_EXPLAINERS[slug].conservativeView}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary stats */}
        {totalAll > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{supportsAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Progressive</div>
            </div>
            <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{opposesAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Conservative</div>
            </div>
            <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{mixedAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Mixed / Neutral</div>
            </div>
            <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
              <div className="text-2xl font-bold text-[var(--codex-text)]">{totalAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Total</div>
            </div>
          </div>
        )}

        {/* Party breakdown */}
        {Object.keys(partyStats).length > 0 && (
          <div className="mb-8 rounded-md border border-[var(--codex-border)] p-4">
            <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--codex-faint)]">
              Party Breakdown
            </div>
            <div className="space-y-3">
              {(['democrat', 'republican', 'independent', 'green'] as const)
                .filter((p) => partyStats[p])
                .map((party) => {
                  const stats = partyStats[party]
                  const supportPct = Math.round((stats.supports / stats.total) * 100)
                  const opposePct = Math.round((stats.opposes / stats.total) * 100)
                  const mixedPct = 100 - supportPct - opposePct
                  const color = partyColor(party)

                  return (
                    <div key={party}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[12px] font-medium" style={{ color }}>
                          {partyLabel(party)}
                        </span>
                        <span className="text-[11px] tabular-nums text-[var(--codex-faint)]">
                          {stats.total} official{stats.total !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="mb-1 flex h-2 overflow-hidden rounded-full bg-[var(--codex-border)]">
                        {supportPct > 0 && (
                          <div className="bg-blue-500/70" style={{ width: `${supportPct}%` }} />
                        )}
                        {mixedPct > 0 && (
                          <div className="bg-purple-500/50" style={{ width: `${mixedPct}%` }} />
                        )}
                        {opposePct > 0 && (
                          <div className="bg-red-500/70" style={{ width: `${opposePct}%` }} />
                        )}
                      </div>
                      <div className="flex gap-4 text-[10px] text-[var(--codex-faint)]">
                        <span className="text-blue-400/70">{supportPct}% progressive</span>
                        <span className="text-purple-400/70">{mixedPct}% mixed</span>
                        <span className="text-red-400/70">{opposePct}% conservative</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Section header for notable stances */}
        <div className="mb-1 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          Where Officials Stand
        </div>
        <p className="mb-6 text-[11px] text-[var(--codex-faint)]">
          Officials grouped by where they land on this issue.
        </p>

        {/* Stance groups: Progressive / Mixed / Conservative / Unknown */}
        {bucketOrder.map((bucket) => {
          const group = stanceGroups[bucket]
          if (!group) return null
          return (
            <StanceGroup
              key={bucket}
              label={group.label}
              color={group.style.color}
              bgClass={group.style.bg}
              textClass={group.style.text}
              entries={group.entries}
              totalCount={group.totalCount}
            />
          )
        })}

        {totalAll === 0 && (
          <div className="py-16 text-center text-[var(--codex-faint)]">
            <div className="mb-2 text-xl font-semibold">No stances recorded yet</div>
            <div className="text-sm">Check back as we track more politician positions</div>
          </div>
        )}

        {/* Browse all link */}
        {totalAll > 0 && (
          <div className="mb-10 rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5 text-center">
            <p className="mb-3 text-[13px] text-[var(--codex-sub)]">
              Want to see every politician&apos;s stance on {issue.name}?
            </p>
            <Link
              href={`/politicians?issue=${slug}`}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--codex-border)] px-5 py-2.5 text-[13px] font-medium text-[var(--codex-text)] no-underline transition-all hover:border-[var(--codex-input-border)] hover:bg-[var(--codex-hover)]"
            >
              Browse all {totalAll} politicians &rarr;
            </Link>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
