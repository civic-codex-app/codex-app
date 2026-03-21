import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { IssueIcon } from '@/components/icons/issue-icon'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { IssueDetailFilters } from '@/components/filters/issue-detail-filters'
import { stanceBucket, STANCE_STYLES, STANCE_ORDER } from '@/lib/utils/stances'
import type { IssueRow, IssueStanceWithPoliticianRow } from '@/lib/types/supabase'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ party?: string; chamber?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from('issues').select('name, description').eq('slug', slug).single()
  if (error) console.error('Failed to fetch issue metadata:', error.message)
  if (!data) return { title: 'Not Found -- Codex' }

  const description = data.description?.slice(0, 160) || `Track where U.S. politicians stand on ${data.name}`
  const ogUrl = `/api/og?title=${encodeURIComponent(data.name)}&subtitle=${encodeURIComponent('Political Stances')}&type=issue`

  return {
    title: `${data.name} | Codex Issues`,
    description,
    openGraph: {
      title: `${data.name} - Political Stances`,
      description,
      url: `https://codexapp.org/issues/${slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} - Political Stances`,
      images: [ogUrl],
    },
  }
}

const STANCE_CONFIG = STANCE_STYLES

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

export default async function IssuePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const supabase = createServiceRoleClient()

  const { data: issueData, error: issueError } = await supabase.from('issues').select('*').eq('slug', slug).single()
  if (issueError) console.error('Failed to fetch issue:', issueError.message)
  if (!issueData) notFound()

  const issue = issueData as any as IssueRow

  const { data: stances, error: stancesError } = await supabase
    .from('politician_issues')
    .select('*, politicians:politician_id(id, name, slug, party, chamber, state, title, image_url)')
    .eq('issue_id', issue.id)
    .order('stance')
  if (stancesError) console.error('Failed to fetch stances for issue:', stancesError.message)

  // All stances before filtering (for stats)
  const allStances = (stances ?? []) as any as IssueStanceWithPoliticianRow[]

  // Apply client-side party/chamber filters
  let stanceList = [...allStances]
  if (sp.party) {
    stanceList = stanceList.filter((s) => s.politicians?.party === sp.party)
  }
  if (sp.chamber) {
    stanceList = stanceList.filter((s) => s.politicians?.chamber === sp.chamber)
  }

  // Compute summary stats from all stances (before filtering)
  const totalAll = allStances.length
  const supportsAll = allStances.filter((s) => stanceBucket(s.stance) === 'supports').length
  const opposesAll = allStances.filter((s) => stanceBucket(s.stance) === 'opposes').length
  const mixedAll = allStances.filter((s) => {
    const b = stanceBucket(s.stance)
    return b === 'mixed' || b === 'neutral'
  }).length

  // Party breakdown stats (from all stances)
  const partyStats: Record<string, { total: number; supports: number; opposes: number; mixed: number }> = {}
  for (const s of allStances) {
    const p = s.politicians?.party
    if (!p) continue
    if (!partyStats[p]) partyStats[p] = { total: 0, supports: 0, opposes: 0, mixed: 0 }
    partyStats[p].total++
    const bucket = stanceBucket(s.stance)
    if (bucket === 'supports') partyStats[p].supports++
    else if (bucket === 'opposes') partyStats[p].opposes++
    else partyStats[p].mixed++
  }

  // Group by stance
  const grouped: Record<string, IssueStanceWithPoliticianRow[]> = {}
  for (const s of stanceList) {
    const key = s.stance
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  }

  const stanceOrder = STANCE_ORDER

  const hasFilters = !!(sp.party || sp.chamber)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${issue.name} - Political Stances`,
    description: issue.description || `Track where U.S. politicians stand on ${issue.name}`,
    url: `https://codexapp.org/issues/${slug}`,
    about: {
      '@type': 'Thing',
      name: issue.name,
      description: issue.description,
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Codex',
      url: 'https://codexapp.org',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[800px] px-6 md:px-10">
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

        <h1 className="mb-3 font-serif text-[clamp(28px,4vw,42px)] font-normal leading-[1.1]">
          {issue.icon && <IssueIcon icon={issue.icon} size={28} className="mr-1 inline-block text-[var(--codex-sub)]" />}
          {issue.name}
        </h1>

        {issue.description && (
          <p className="mb-6 text-[15px] leading-[1.7] text-[var(--codex-sub)]">{issue.description}</p>
        )}

        {/* Summary stats */}
        {totalAll > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
              <div className="font-serif text-2xl text-green-400">{supportsAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Support</div>
            </div>
            <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
              <div className="font-serif text-2xl text-red-400">{opposesAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Oppose</div>
            </div>
            <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
              <div className="font-serif text-2xl text-yellow-400">{mixedAll}</div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Mixed / Neutral</div>
            </div>
            <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
              <div className="font-serif text-2xl text-[var(--codex-text)]">{totalAll}</div>
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
                          <div className="bg-green-500/70" style={{ width: `${supportPct}%` }} />
                        )}
                        {mixedPct > 0 && (
                          <div className="bg-yellow-500/50" style={{ width: `${mixedPct}%` }} />
                        )}
                        {opposePct > 0 && (
                          <div className="bg-red-500/70" style={{ width: `${opposePct}%` }} />
                        )}
                      </div>
                      <div className="flex gap-4 text-[10px] text-[var(--codex-faint)]">
                        <span className="text-green-400/70">{supportPct}% support</span>
                        <span className="text-yellow-400/70">{mixedPct}% mixed</span>
                        <span className="text-red-400/70">{opposePct}% oppose</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Filters */}
        <Suspense>
          <IssueDetailFilters />
        </Suspense>

        {/* Filtered count */}
        {hasFilters && (
          <div className="mb-4 text-[11px] text-[var(--codex-faint)]">
            Showing {stanceList.length} of {totalAll} stances
          </div>
        )}

        {stanceOrder.map((stance) => {
          const items = grouped[stance]
          if (!items || items.length === 0) return null
          const config = STANCE_CONFIG[stance] ?? STANCE_CONFIG.unknown
          return (
            <section key={stance} className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
                <span className={`rounded-sm px-2 py-0.5 text-[10px] ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
                <span className="text-[var(--codex-faint)]">{items.length}</span>
              </h2>
              <div className="space-y-2">
                {items.map((s) => {
                  const pol = s.politicians
                  if (!pol) return null
                  return (
                    <Link
                      key={s.id}
                      href={`/politicians/${pol.slug}`}
                      className="group flex items-center gap-4 rounded-md border border-[var(--codex-border)] p-4 no-underline transition-all hover:border-[var(--codex-input-border)]"
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[var(--codex-card)]">
                        <AvatarImage
                          src={pol.image_url}
                          alt={pol.name}
                          size={40}
                          party={pol.party}
                          fallbackColor={partyColor(pol.party)}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium transition-colors group-hover:text-[var(--codex-text)]">
                            {pol.name}
                          </span>
                          <span
                            className="text-[10px] font-medium uppercase"
                            style={{ color: partyColor(pol.party) }}
                          >
                            {partyLabel(pol.party)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--codex-faint)]">
                          {pol.title} &middot; {pol.state}
                        </div>
                        {s.summary && (
                          <p className="mt-1 text-[12px] leading-[1.5] text-[var(--codex-sub)]">{s.summary}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}

        {stanceList.length === 0 && (
          <div className="py-16 text-center text-[var(--codex-faint)]">
            <div className="mb-2 font-serif text-xl">No stances recorded yet</div>
            <div className="text-sm">Check back as we track more politician positions</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
