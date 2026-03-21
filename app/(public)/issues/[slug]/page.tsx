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

import { STANCE_STYLES, STANCE_ORDER } from '@/lib/utils/stances'
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

  // Apply client-side party/chamber filters
  let stanceList = (stances ?? []) as any as IssueStanceWithPoliticianRow[]
  if (sp.party) {
    stanceList = stanceList.filter((s) => s.politicians?.party === sp.party)
  }
  if (sp.chamber) {
    stanceList = stanceList.filter((s) => s.politicians?.chamber === sp.chamber)
  }

  // Group by stance
  const grouped: Record<string, IssueStanceWithPoliticianRow[]> = {}
  for (const s of stanceList) {
    const key = s.stance
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  }

  const stanceOrder = STANCE_ORDER

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
            {stanceList.length} politician{stanceList.length !== 1 ? 's' : ''}
          </span>
        </div>

        <h1 className="mb-3 font-serif text-[clamp(28px,4vw,42px)] font-normal leading-[1.1]">
          {issue.icon && <IssueIcon icon={issue.icon} size={28} className="mr-1 inline-block text-[var(--codex-sub)]" />}
          {issue.name}
        </h1>

        {issue.description && (
          <p className="mb-8 text-[15px] leading-[1.7] text-[var(--codex-sub)]">{issue.description}</p>
        )}

        {/* Filters */}
        <Suspense>
          <IssueDetailFilters />
        </Suspense>

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
