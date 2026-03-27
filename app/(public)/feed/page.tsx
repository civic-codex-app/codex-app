import { Suspense } from 'react'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ActivityItem, type ActivityItemProps } from '@/components/feed/activity-item'
import { FeedFilters } from '@/components/feed/feed-filters'
import { NewsHighlightCard } from '@/components/feed/news-highlight-card'
import { PollCard } from '@/components/feed/poll-card'
import { ElectionCountdownCard } from '@/components/feed/election-countdown-card'
import { FinanceHighlightCard } from '@/components/feed/finance-highlight-card'
import { getCachedNews } from '@/lib/utils/news'
import Link from 'next/link'

export const revalidate = 120 // 2 minutes

export const metadata = {
  title: 'Activity Feed | Poli',
  description:
    'Live feed of political activity — news headlines, votes, stance changes, polls, elections, and campaign finance. Filter by party and state.',
}

interface PageProps {
  searchParams: Promise<{ party?: string; state?: string; page?: string }>
}

/* ------------------------------------------------------------------ */
/*  Data Types                                                         */
/* ------------------------------------------------------------------ */

interface FeedItem {
  type: 'vote'
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

interface VoteRow {
  id: string
  bill_name: string | null
  bill_number: string | null
  bill_id: string | null
  vote: string
  vote_date: string | null
  politicians: {
    name: string; slug: string; party: string; image_url: string | null; state: string | null
  } | null
}

/* ------------------------------------------------------------------ */
/*  Data Fetching                                                      */
/* ------------------------------------------------------------------ */

async function fetchActivityItems(
  party?: string,
  state?: string,
  page = 1,
): Promise<{ items: FeedItem[]; hasMore: boolean }> {
  const supabase = createServiceRoleClient()
  const PAGE_SIZE = 8
  const from = (page - 1) * PAGE_SIZE

  let voteQuery = supabase
    .from('voting_records')
    .select('id, bill_name, bill_number, bill_id, vote, vote_date, politicians:politician_id(name, slug, party, image_url, state)')
    .not('vote_date', 'is', null)
    .order('vote_date', { ascending: false })
    .limit(PAGE_SIZE)

  if (party) voteQuery = voteQuery.eq('politicians.party', party)

  const { data: voteData } = await voteQuery

  const items: FeedItem[] = []

  for (const v of (voteData ?? []) as unknown as VoteRow[]) {
    if (!v.politicians) continue
    if (state && v.politicians.state !== state) continue
    items.push({
      type: 'vote',
      date: v.vote_date ?? '',
      politician: v.politicians,
      details: { kind: 'vote', billName: v.bill_name, billNumber: v.bill_number, billId: v.bill_id, vote: v.vote },
    })
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const pageItems = items.slice(from, from + PAGE_SIZE + 1)
  const hasMore = pageItems.length > PAGE_SIZE
  return { items: pageItems.slice(0, PAGE_SIZE), hasMore }
}

async function fetchActivePolls() {
  const supabase = createServiceRoleClient()
  const { data: polls } = await supabase
    .from('polls')
    .select('id, question, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!polls || polls.length === 0) return []

  const pollIds = polls.map((p) => p.id)
  const { data: options } = await supabase
    .from('poll_options')
    .select('id, poll_id, text, vote_count')
    .in('poll_id', pollIds)
    .order('vote_count', { ascending: false })

  return polls.map((p) => {
    const opts = (options ?? []).filter((o) => o.poll_id === p.id)
    const total = opts.reduce((sum, o) => sum + (o.vote_count ?? 0), 0)
    return { id: p.id, question: p.question, options: opts, total_votes: total }
  })
}

async function fetchUpcomingRaces() {
  const supabase = createServiceRoleClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: races } = await supabase
    .from('races')
    .select(`
      id, name, slug, state, chamber,
      elections:election_id (slug, election_date)
    `)
    .limit(100)

  if (!races) return []

  // Filter to future elections and get candidates
  const upcoming = races
    .filter((r: any) => r.elections?.election_date && r.elections.election_date >= today)
    .sort((a: any, b: any) => a.elections.election_date.localeCompare(b.elections.election_date))
    .slice(0, 4)

  if (upcoming.length === 0) return []

  const raceIds = upcoming.map((r: any) => r.id)
  const { data: candidates } = await supabase
    .from('candidates')
    .select('race_id, name, party, image_url')
    .in('race_id', raceIds)
    .eq('status', 'running')
    .limit(50)

  return upcoming.map((r: any) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    state: r.state,
    chamber: r.chamber,
    election_slug: r.elections.slug,
    election_date: r.elections.election_date,
    candidates: (candidates ?? []).filter((c: any) => c.race_id === r.id),
  }))
}

async function fetchTopFundraisers() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('campaign_finance')
    .select('cycle, total_raised, total_spent, cash_on_hand, politicians:politician_id(name, slug, party, image_url)')
    .not('total_raised', 'is', null)
    .order('total_raised', { ascending: false })
    .limit(5)

  if (!data) return []

  return data
    .filter((r: any) => r.politicians)
    .map((r: any) => ({
      politician: r.politicians,
      cycle: r.cycle,
      total_raised: r.total_raised ?? 0,
      total_spent: r.total_spent ?? 0,
      cash_on_hand: r.cash_on_hand ?? 0,
    }))
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function FeedPage({ searchParams }: PageProps) {
  const params = await searchParams
  const party = params.party ?? ''
  const state = params.state ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  // Fetch all data in parallel
  const [
    { items, hasMore },
    polls,
    races,
    fundraisers,
    newsArticles,
  ] = await Promise.all([
    fetchActivityItems(party || undefined, state || undefined, page),
    fetchActivePolls(),
    fetchUpcomingRaces(),
    fetchTopFundraisers(),
    getCachedNews('US Congress'),
  ])

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
      <main id="main-content" className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:px-10">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
            Feed
          </h1>
          <p className="text-[15px] leading-[1.7] text-[var(--poli-sub)]">
            The latest in politics — news, votes, elections, and more.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Suspense fallback={null}>
            <FeedFilters />
          </Suspense>
        </div>

        {/* Top row: News + Sidebar */}
        {page === 1 && (
          <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_340px]">
            <NewsHighlightCard articles={newsArticles} />
            <div className="flex flex-col gap-5">
              {polls.length > 0 && <PollCard poll={polls[0]} />}
              {races.length > 0 && <ElectionCountdownCard race={races[0]} />}
            </div>
          </div>
        )}

        {/* Middle row: Finance + Extra widgets */}
        {page === 1 && (fundraisers.length > 0 || races.length > 1) && (
          <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fundraisers.length > 0 && <FinanceHighlightCard records={fundraisers} />}
            {races.slice(1, 3).map((r) => (
              <ElectionCountdownCard key={r.id} race={r} />
            ))}
          </div>
        )}

        {/* Activity feed — compact, max 6 per page */}
        {items.length > 0 && (
          <>
            <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
              {page > 1 ? `Page ${page}` : 'Latest Activity'}
            </div>

            <div className="flex flex-col gap-2.5">
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
            {(hasMore || page > 1) && (
              <div className="mt-6 flex items-center justify-center gap-4">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="rounded-lg border border-[var(--poli-border)] px-4 py-2 text-sm font-medium text-[var(--poli-sub)] no-underline transition-colors hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]"
                  >
                    Previous
                  </Link>
                )}
                {hasMore && (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="rounded-lg border border-[var(--poli-border)] px-4 py-2 text-sm font-medium text-[var(--poli-sub)] no-underline transition-colors hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]"
                  >
                    Load More
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {items.length === 0 && page > 1 && (
          <div className="py-20 text-center">
            <div className="mb-2 text-lg font-medium text-[var(--poli-text)]">
              No more activity
            </div>
            <p className="text-sm text-[var(--poli-sub)]">
              You&apos;ve reached the end.
            </p>
          </div>
        )}

        <Footer />
      </main>
    </>
  )
}
