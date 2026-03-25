import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { VoterGrid } from '@/components/community/voter-grid'
import { StateFilterSelect } from '@/components/community/state-filter-select'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 300 // 5 min

export const metadata: Metadata = {
  title: 'Community | Poli',
  description:
    'See where anonymous voters stand on the issues. Compare your political stances with others and find common ground.',
}

const PER_PAGE = 24

interface PageProps {
  searchParams: Promise<{ state?: string; page?: string }>
}

function formatEstimate(n: number): string {
  if (n >= 10000) return `${Math.floor(n / 1000)}k+`
  if (n >= 1000) return `${(Math.floor(n / 100) / 10).toFixed(1)}k+`.replace('.0k+', 'k+')
  if (n >= 100) return `${Math.floor(n / 10) * 10}+`
  if (n >= 10) return `${Math.floor(n / 5) * 5}+`
  return String(n)
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const params = await searchParams
  const stateFilter = params.state ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  const supabase = createServiceRoleClient()

  // Fetch issues and community stats in parallel
  const [
    { data: issues },
    { count: totalVoters },
    { count: totalLikes },
    { count: totalFollows },
    { count: totalIssueFollows },
    { count: totalBillFollows },
  ] = await Promise.all([
    supabase.from('issues').select('slug, name').order('name'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('sharing_enabled', true).not('quiz_answers', 'is', null),
    supabase.from('likes').select('*', { count: 'exact', head: true }),
    supabase.from('follows').select('*', { count: 'exact', head: true }),
    supabase.from('issue_follows').select('*', { count: 'exact', head: true }),
    supabase.from('bill_follows').select('*', { count: 'exact', head: true }),
  ])

  // Build query — only select anonymous-safe columns
  let query = supabase
    .from('profiles')
    .select('anonymous_id, state, quiz_answers', { count: 'exact' })
    .eq('sharing_enabled', true)
    .not('quiz_answers', 'is', null)

  if (stateFilter) {
    query = query.eq('state', stateFilter)
  }

  const from = (page - 1) * PER_PAGE
  const { data: voters, count } = await query
    .range(from, from + PER_PAGE - 1)

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE)

  // Filter out empty quiz_answers client-side (Supabase can't easily filter JSONB != '{}')
  const validVoters = (voters ?? []).filter(
    (v) => v.anonymous_id && v.quiz_answers && Object.keys(v.quiz_answers as Record<string, string>).length > 0
  )

  function buildUrl(p: number, state?: string) {
    const sp = new URLSearchParams()
    if (state) sp.set('state', state)
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return `/community${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:px-10">
        <div className="mb-6">
          <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
            Community
          </h1>
          <p className="text-[15px] leading-[1.7] text-[var(--poli-sub)]">
            See where anonymous voters stand on the issues. Compare your stances with theirs.
          </p>
        </div>

        {/* Community stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Voters', value: formatEstimate(totalVoters ?? 0) },
            { label: 'Likes', value: formatEstimate(totalLikes ?? 0) },
            { label: 'Follows', value: formatEstimate(totalFollows ?? 0) },
            { label: 'Issues Tracked', value: formatEstimate(totalIssueFollows ?? 0) },
            { label: 'Bills Saved', value: formatEstimate(totalBillFollows ?? 0) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[var(--poli-border)] px-4 py-3 text-center">
              <div className="text-[18px] font-bold text-[var(--poli-text)]">{stat.value}</div>
              <div className="text-[11px] text-[var(--poli-faint)]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* State filter */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            href={buildUrl(1)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium no-underline transition-colors ${
              !stateFilter
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-[var(--poli-sub)] hover:text-[var(--poli-text)]'
            }`}
          >
            All States
          </Link>
          <StateFilterSelect current={stateFilter} />
          {count !== null && (
            <span className="text-[12px] text-[var(--poli-faint)]">
              {count} voter{count !== 1 ? 's' : ''} sharing
            </span>
          )}
        </div>

        {/* Voter grid */}
        {validVoters.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[var(--poli-text)]">
              No voters sharing yet
            </h2>
            <p className="mx-auto max-w-[360px] text-[13px] text-[var(--poli-sub)]">
              Be the first! Take the quiz and enable sharing in your account settings
              to appear here anonymously.
            </p>
            <Link
              href="/quiz"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-[13px] font-semibold text-white no-underline transition-all hover:bg-blue-700"
            >
              Take the Quiz
            </Link>
          </div>
        ) : (
          <>
            <VoterGrid
              voters={validVoters.map((v) => ({
                anonymousId: v.anonymous_id!,
                state: v.state,
                stances: v.quiz_answers as Record<string, string>,
              }))}
              issues={issues ?? []}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                {page > 1 && (
                  <Link
                    href={buildUrl(page - 1, stateFilter || undefined)}
                    className="rounded-lg border border-[var(--poli-border)] px-4 py-2 text-sm font-medium text-[var(--poli-sub)] no-underline transition-colors hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-[12px] text-[var(--poli-faint)]">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={buildUrl(page + 1, stateFilter || undefined)}
                    className="rounded-lg border border-[var(--poli-border)] px-4 py-2 text-sm font-medium text-[var(--poli-sub)] no-underline transition-colors hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        <Footer />
      </main>
    </>
  )
}
