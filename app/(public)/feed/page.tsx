import { Suspense } from 'react'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ActivityItem, type ActivityItemProps } from '@/components/feed/activity-item'
import { FeedFilters } from '@/components/feed/feed-filters'
import Link from 'next/link'

export const revalidate = 300 // 5 minutes

export const metadata = {
  title: 'Activity Feed | Poli',
  description: 'Live feed of political activity — new votes, stance changes, and election updates. Filter by party and state to follow what matters to you.',
}

const PAGE_SIZE = 50

interface PageProps {
  searchParams: Promise<{ party?: string; state?: string; page?: string }>
}

interface FeedItem {
  type: 'vote' | 'stance'
  date: string
  politician: {
    name: string
    slug: string
    party: string
    image_url: string | null
    state: string | null
  }
  details: ActivityItemProps['details']
}

async function fetchFeedItems(
  party?: string,
  state?: string,
  page = 1,
): Promise<{ items: FeedItem[]; hasMore: boolean }> {
  const supabase = createServiceRoleClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE // fetch one extra to detect hasMore

  // Calculate 30 days ago
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateThreshold = thirtyDaysAgo.toISOString().split('T')[0]

  // --- Fetch voting records (capped to avoid slow queries) ---
  let voteQuery = supabase
    .from('voting_records')
    .select(
      'id, bill_name, bill_number, bill_id, vote, vote_date, politicians:politician_id(name, slug, party, image_url, state)',
    )
    .gte('vote_date', dateThreshold)
    .order('vote_date', { ascending: false })
    .limit(PAGE_SIZE)

  if (party) {
    voteQuery = voteQuery.eq('politicians.party', party)
  }

  const { data: voteData, error: voteErr } = await voteQuery
  if (voteErr) console.error('Failed to fetch voting records:', voteErr.message)
  const allVotes = (voteData ?? []) as unknown as VoteRow[]

  // --- Fetch stance updates (capped) ---
  let stanceQuery = supabase
    .from('politician_issues')
    .select(
      'id, stance, updated_at, politicians:politician_id(name, slug, party, image_url, state), issues:issue_id(name, slug, icon)',
    )
    .gte('updated_at', dateThreshold)
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (party) {
    stanceQuery = stanceQuery.eq('politicians.party', party)
  }

  const { data: stanceData, error: stanceErr } = await stanceQuery
  if (stanceErr) console.error('Failed to fetch stance updates:', stanceErr.message)
  const allStances = (stanceData ?? []) as unknown as StanceRow[]

  // --- Merge into unified feed ---
  const items: FeedItem[] = []

  for (const v of allVotes) {
    if (!v.politicians) continue
    const pol = v.politicians as { name: string; slug: string; party: string; image_url: string | null; state: string | null }
    if (state && pol.state !== state) continue
    items.push({
      type: 'vote',
      date: v.vote_date ?? '',
      politician: pol,
      details: {
        kind: 'vote',
        billName: v.bill_name,
        billNumber: v.bill_number,
        billId: v.bill_id,
        vote: v.vote,
      },
    })
  }

  for (const s of allStances) {
    if (!s.politicians || !s.issues) continue
    const pol = s.politicians as { name: string; slug: string; party: string; image_url: string | null; state: string | null }
    const issue = s.issues as { name: string; slug: string; icon: string | null }
    if (state && pol.state !== state) continue
    items.push({
      type: 'stance',
      date: s.updated_at ?? '',
      politician: pol,
      details: {
        kind: 'stance',
        issueName: issue.name,
        issueSlug: issue.slug,
        issueIcon: issue.icon,
        stance: s.stance,
      },
    })
  }

  // Sort by date descending
  items.sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Paginate
  const pageItems = items.slice(from, to + 1)
  const hasMore = pageItems.length > PAGE_SIZE
  return { items: pageItems.slice(0, PAGE_SIZE), hasMore }
}

// Internal row types for Supabase join results
interface VoteRow {
  id: string
  bill_name: string | null
  bill_number: string | null
  bill_id: string | null
  vote: string
  vote_date: string | null
  politicians: {
    name: string
    slug: string
    party: string
    image_url: string | null
    state: string | null
  } | null
}

interface StanceRow {
  id: string
  stance: string
  updated_at: string | null
  politicians: {
    name: string
    slug: string
    party: string
    image_url: string | null
    state: string | null
  } | null
  issues: {
    name: string
    slug: string
    icon: string | null
  } | null
}

export default async function FeedPage({ searchParams }: PageProps) {
  const params = await searchParams
  const party = params.party ?? ''
  const state = params.state ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  const { items, hasMore } = await fetchFeedItems(
    party || undefined,
    state || undefined,
    page,
  )

  // Build next/prev page URLs
  function buildPageUrl(p: number): string {
    const sp = new URLSearchParams()
    if (party) sp.set('party', party)
    if (state) sp.set('state', state)
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return `/feed${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <Header />
      <main
        id="main-content"
        className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:px-10"
      >
        {/* Page header */}
        <div className="mb-8">
          <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
            Activity Feed
          </h1>
          <p className="text-[15px] leading-[1.7] text-[var(--codex-sub)]">
            Recent votes, stance updates, and political activity from the last 30 days.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--codex-faint)]">
            Filter
          </div>
          <Suspense fallback={null}>
            <FeedFilters />
          </Suspense>
        </div>

        {/* Feed items */}
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-2 text-lg font-medium text-[var(--codex-text)]">
              No recent activity
            </div>
            <p className="text-sm text-[var(--codex-sub)]">
              {party || state
                ? 'Try adjusting your filters to see more results.'
                : 'Check back soon for the latest political activity.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              {page > 1 ? `Page ${page}` : 'Latest Activity'}
            </div>
            <div className="flex flex-col gap-2">
              {items.map((item, i) => (
                <ActivityItem
                  key={`${item.type}-${i}`}
                  type={item.type}
                  politician={item.politician}
                  date={item.date}
                  details={item.details}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-4">
              {page > 1 && (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="rounded-lg border border-[var(--codex-border)] px-4 py-2 text-sm font-medium text-[var(--codex-sub)] no-underline transition-colors hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
                >
                  Previous
                </Link>
              )}
              {hasMore && (
                <Link
                  href={buildPageUrl(page + 1)}
                  className="rounded-lg border border-[var(--codex-border)] px-4 py-2 text-sm font-medium text-[var(--codex-sub)] no-underline transition-colors hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
                >
                  Load More
                </Link>
              )}
            </div>
          </>
        )}
        <Footer />
      </main>
    </>
  )
}
