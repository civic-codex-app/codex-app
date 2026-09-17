import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { IssueIcon } from '@/components/icons/issue-icon'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import type { IssueRow } from '@/lib/types/supabase'
import { ISSUE_EXPLAINERS } from '@/lib/data/educational-content'
import { StanceGroup } from '@/components/issues/stance-group'
import { getIssueStanceGroups, trimEntry, INITIAL_ENTRIES, STANCE_BUCKETS } from '@/lib/issues/stance-groups'
import { FollowIssueButton } from '@/components/issues/follow-issue-button'
import { EstimatedStanceNote } from '@/components/ui/estimated-stance-note'

export const revalidate = 3600 // 1 hour

/**
 * On-demand ISR. Without generateStaticParams a dynamic segment renders on
 * every request no matter what revalidate says — checked against the
 * production build: no x-nextjs-cache header, Cache-Control no-store, about
 * a second per hit. Returning no params prerenders nothing at build time (so
 * the build does not depend on Supabase) and caches each issue page for
 * revalidate seconds after its first visitor.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from('issues').select('name, description').eq('slug', slug).single()
  if (error) console.error('Failed to fetch issue metadata:', error.message)
  if (!data) return { title: 'Not Found | Poli' }

  const description = data.description?.slice(0, 160) || `Track where U.S. politicians stand on ${data.name}`
  const ogUrl = `/api/og?title=${encodeURIComponent(data.name)}&subtitle=${encodeURIComponent('Political Stances')}&type=issue`

  return {
    title: `${data.name} | Poli Issues`,
    description,
    alternates: { canonical: `https://getpoli.app/issues/${slug}` },
    openGraph: {
      title: `${data.name} - Political Stances`,
      description,
      url: `https://getpoli.app/issues/${slug}`,
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

export default async function IssuePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceRoleClient()

  const { data: issueData, error: issueError } = await supabase.from('issues').select('*').eq('slug', slug).single()
  if (issueError) console.error('Failed to fetch issue:', issueError.message)
  if (!issueData) notFound()

  const issue = issueData as any as IssueRow

  // Get follow count (service role bypasses RLS) and check if user follows
  const { count: issueFollowCount } = await supabase
    .from('issue_follows')
    .select('*', { count: 'exact', head: true })
    .eq('issue_id', issue.id)

  // Whether the visitor follows this issue is resolved in the FollowIssueButton
  // on the client. Reading cookies here would make the page render on every
  // request — ~8,600 rows each time — and silently defeat the hourly
  // revalidate above.

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

  const [totalRes, supportsRes, opposesRes, stanceGroups,
    demTotalR, demSupR, demOppR,
    gopTotalR, gopSupR, gopOppR,
    indTotalR, indSupR, indOppR,
  ] = await Promise.all([
    countQ(),
    countQ({ stance: supportStances }),
    countQ({ stance: opposeStances }),
    getIssueStanceGroups(supabase, issue.id),
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${issue.name} - Political Stances`,
    description: issue.description || `Track where U.S. politicians stand on ${issue.name}`,
    url: `https://getpoli.app/issues/${slug}`,
    about: { '@type': 'Thing', name: issue.name, description: issue.description },
    isPartOf: { '@type': 'WebSite', name: 'Poli', url: 'https://getpoli.app' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <Link
          href="/issues"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--poli-sub)] transition-colors hover:text-[var(--poli-text)]"
        >
          &larr; Back to issues
        </Link>

        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-sm bg-[var(--poli-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--poli-badge-text)]">
            {CATEGORY_LABELS[issue.category] ?? issue.category}
          </span>
          <span className="text-[11px] text-[var(--poli-faint)]">
            {totalAll} politician{totalAll !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
            {issue.icon && <IssueIcon icon={issue.icon} size={28} className="mr-1 inline-block text-[var(--poli-sub)]" />}
            {issue.name}
          </h1>
          <FollowIssueButton issueId={issue.id} initialCount={issueFollowCount ?? 0} className="mt-2 flex-shrink-0" />
        </div>

        {issue.description && (
          <p className="mb-6 text-[15px] leading-[1.7] text-[var(--poli-sub)]">{issue.description}</p>
        )}

        {/* What this means — educational explainer */}
        {ISSUE_EXPLAINERS[slug] && (
          <div className="mb-6 rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--poli-faint)]">
              What This Means
            </div>
            <p className="mb-3 text-[13px] leading-[1.6] text-[var(--poli-sub)]">
              {ISSUE_EXPLAINERS[slug].description}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-blue-500/5 px-3 py-2">
                <span className="text-[11px] font-medium text-blue-400">Progressive</span>
                <p className="mt-0.5 text-[12px] leading-[1.5] text-[var(--poli-sub)]">{ISSUE_EXPLAINERS[slug].progressiveView}</p>
              </div>
              <div className="rounded-md bg-red-500/5 px-3 py-2">
                <span className="text-[11px] font-medium text-red-400">Conservative</span>
                <p className="mt-0.5 text-[12px] leading-[1.5] text-[var(--poli-sub)]">{ISSUE_EXPLAINERS[slug].conservativeView}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary stats */}
        {totalAll > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-[var(--poli-border)] p-3 text-center">
              <div className="text-2xl font-bold" style={{ color: '#2563EB' }}>{supportsAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--poli-faint)]">Favors</div>
            </div>
            <div className="rounded-md border border-[var(--poli-border)] p-3 text-center">
              <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>{opposesAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--poli-faint)]">Opposes</div>
            </div>
            <div className="rounded-md border border-[var(--poli-border)] p-3 text-center">
              <div className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>{mixedAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--poli-faint)]">Mixed / Neutral</div>
            </div>
            <div className="rounded-md border border-[var(--poli-border)] p-3 text-center">
              <div className="text-2xl font-bold text-[var(--poli-text)]">{totalAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--poli-faint)]">Total</div>
            </div>
          </div>
        )}

        {/* Party breakdown */}
        {Object.keys(partyStats).length > 0 && (
          <div className="mb-8 rounded-md border border-[var(--poli-border)] p-4">
            <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--poli-faint)]">
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
                        <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color }}>
                          <PartyIcon party={party} size={12} />
                        </span>
                        <span className="text-[11px] tabular-nums text-[var(--poli-faint)]">
                          {stats.total} official{stats.total !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="mb-1 flex h-2 overflow-hidden rounded-full bg-[var(--poli-border)]">
                        {supportPct > 0 && (
                          <div style={{ width: `${supportPct}%`, backgroundColor: '#2563EB' }} />
                        )}
                        {mixedPct > 0 && (
                          <div style={{ width: `${mixedPct}%`, backgroundColor: '#8B5CF6' }} />
                        )}
                        {opposePct > 0 && (
                          <div style={{ width: `${opposePct}%`, backgroundColor: '#DC2626' }} />
                        )}
                      </div>
                      <div className="flex gap-4 text-[10px] text-[var(--poli-faint)]">
                        <span style={{ color: '#2563EB' }}>{supportPct}% favors</span>
                        <span style={{ color: '#8B5CF6' }}>{mixedPct}% mixed</span>
                        <span style={{ color: '#DC2626' }}>{opposePct}% opposes</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Section header for notable stances */}
        <div className="mb-1 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
          Where Officials Stand
        </div>
        <p className="mb-3 text-[11px] text-[var(--poli-faint)]">
          Officials grouped by where they land on this issue.
        </p>

        <EstimatedStanceNote className="mb-6" />

        {/* Stance groups: Progressive / Mixed / Conservative / Unknown */}
        {STANCE_BUCKETS.map((bucket) => {
          const group = stanceGroups[bucket]
          if (!group) return null
          return (
            <StanceGroup
              key={bucket}
              issueSlug={slug}
              bucket={bucket}
              label={group.label}
              color={group.style.color}
              bgClass={group.style.bg}
              textClass={group.style.text}
              entries={group.entries.slice(0, INITIAL_ENTRIES).map(trimEntry)}
              entryCount={group.entries.length}
              totalCount={group.totalCount}
            />
          )
        })}

        {totalAll === 0 && (
          <div className="py-16 text-center text-[var(--poli-faint)]">
            <div className="mb-2 text-xl font-semibold">No stances recorded yet</div>
            <div className="text-sm">Check back as we track more politician positions</div>
          </div>
        )}

        {/* Directory link. This used to promise "Browse all N politicians" and
            point at /politicians?issue=…, a page that does not exist — every
            issue page carried a 404. Everyone is already listed above, grouped
            and expandable, so send people who want one person to the directory. */}
        {totalAll > 0 && (
          <div className="mb-10 rounded-md border border-[var(--poli-border)] bg-[var(--poli-card)] p-5 text-center">
            <p className="mb-3 text-[13px] text-[var(--poli-sub)]">
              Looking for a specific official?
            </p>
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--poli-border)] px-5 py-2.5 text-[13px] font-medium text-[var(--poli-text)] no-underline transition-all hover:border-[var(--poli-input-border)] hover:bg-[var(--poli-hover)]"
            >
              Browse the directory &rarr;
            </Link>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
