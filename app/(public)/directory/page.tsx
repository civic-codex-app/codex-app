import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AppShell, Card } from '@/components/app/surface'
import { Face } from '@/components/app/face'
import { SearchInput } from '@/components/directory/search-input'
import { DirectoryFilters } from '@/components/directory/directory-filters'
import { DirectoryView } from '@/components/directory/directory-view'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { STATE_NAMES } from '@/lib/constants/us-states'

/**
 * Two directories in one route.
 *
 * The default is the quiet one: one state's Congress members and governor,
 * grouped, with the visitor's own marked (components/directory/directory-view.tsx).
 * It resolves the state on the client from the ZIP, so with no query string
 * this route could be static; it stays dynamic because the second directory
 * — every one of the 8,600 officials, faceted by state, party and level, 50
 * a page — still reads searchParams, and one route cannot be both.
 *
 * The full list is reached with ?all=1 or any facet, and from the quiet
 * view's footer.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Reps | Poli',
  description: 'Your senators, representative and governor, and every other elected official in Poli — searchable by state, party and level of government.',
}

interface PageProps {
  searchParams: Promise<{ state?: string; party?: string; chamber?: string; page?: string; all?: string; q?: string }>
}

const PAGE_SIZE = 50

interface FacetRow {
  party: string | null
  chamber: string | null
  state: string | null
}

/**
 * Every politician's facet dimensions, fetched once and cached. The roster
 * changes rarely, so this survives across requests and page-number changes.
 */
const getFacetRows = unstable_cache(
  async (): Promise<FacetRow[]> => {
    const supabase = createServiceRoleClient()
    const all: FacetRow[] = []
    let from = 0
    for (;;) {
      const { data } = await supabase
        .from('politicians')
        .select('party, chamber, state')
        .range(from, from + 999)
      if (!data || data.length === 0) break
      all.push(...(data as FacetRow[]))
      if (data.length < 1000) break
      from += 1000
    }
    return all
  },
  ['directory-facet-rows'],
  { revalidate: 1800, tags: ['politicians'] }
)

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams
  const browse = params.all === '1' || !!params.party || !!params.chamber || !!params.page || !!params.q

  if (!browse) {
    const initialState = params.state && STATE_NAMES[params.state.toUpperCase()] ? params.state.toUpperCase() : null
    return (
      <AppShell>
        <div className="mx-auto max-w-[560px] px-4 pt-5">
          <DirectoryView initialState={initialState} />
        </div>
      </AppShell>
    )
  }

  const supabase = createServiceRoleClient()
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  // One cached projection of every politician's (party, chamber, state) serves all
  // three cascading facet counts.
  const [facetRows, pageResult] = await Promise.all([
    getFacetRows(),
    (async () => {
      let query = supabase
        .from('politicians')
        .select('id, name, slug, party, state, chamber, title, image_url', { count: 'exact' })
      if (params.state) query = query.eq('state', params.state)
      if (params.party) query = query.eq('party', params.party)
      if (params.chamber) query = query.eq('chamber', params.chamber)
      query = query.order('name').range(offset, offset + PAGE_SIZE - 1)
      return query
    })(),
  ])

  // Cascading semantics preserved exactly: each facet applies the OTHER two
  // filters but not its own, so selecting a party still shows sibling counts.
  const tally = (
    key: 'party' | 'chamber' | 'state',
    keep: (r: FacetRow) => boolean
  ): Record<string, number> => {
    const counts: Record<string, number> = {}
    for (const r of facetRows) {
      const v = r[key]
      if (!v || !keep(r)) continue
      counts[v] = (counts[v] || 0) + 1
    }
    return counts
  }
  const matchState = (r: FacetRow) => !params.state || r.state === params.state
  const matchParty = (r: FacetRow) => !params.party || r.party === params.party
  const matchChamber = (r: FacetRow) => !params.chamber || r.chamber === params.chamber

  const filterCounts = {
    parties: tally('party', (r) => matchState(r) && matchChamber(r)),
    chambers: tally('chamber', (r) => matchState(r) && matchParty(r)),
    states: tally('state', (r) => matchParty(r) && matchChamber(r)),
  }

  const politicians = pageResult.data ?? []
  const totalCount = pageResult.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  function buildUrl(overrides: Record<string, string>) {
    const p: Record<string, string> = { all: '1' }
    if (params.state) p.state = params.state
    if (params.party) p.party = params.party
    if (params.chamber) p.chamber = params.chamber
    Object.assign(p, overrides)
    if (p.page === '1') delete p.page
    const qs = new URLSearchParams(p).toString()
    return `/directory${qs ? `?${qs}` : ''}`
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] px-4 pt-5 md:px-10">
        <Link href="/directory" className="mb-2 inline-flex h-11 items-center gap-1 text-[14px] font-semibold text-[var(--poli-sub)] no-underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Reps
        </Link>
        <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Everyone</h1>
        <p className="mb-4 mt-1 text-[14px] text-[var(--poli-sub)]">
          {totalCount.toLocaleString()} official{totalCount !== 1 ? 's' : ''}
        </p>

        <Suspense>
          <SearchInput basePath="/directory" />
        </Suspense>

        <Suspense>
          <DirectoryFilters counts={filterCounts} stateNames={STATE_NAMES} />
        </Suspense>

        <div className="mb-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {politicians.map((pol) => (
            <Link key={pol.id} href={`/politicians/${pol.slug}`} className="no-underline">
              <Card flush className="flex items-center gap-3 px-3.5 py-3">
                <Face src={pol.image_url} alt={pol.name} size={44} party={pol.party} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-[var(--poli-text)]">{pol.name}</span>
                  <span className="block truncate text-[12.5px] text-[var(--poli-sub)]">
                    {pol.title ?? (CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber)} · {pol.state}
                  </span>
                </span>
              </Card>
            </Link>
          ))}

          {politicians.length === 0 && (
            <div className="py-16 text-center text-[var(--poli-faint)]">
              <div className="mb-2 text-xl font-semibold">No officials found</div>
              <div className="text-sm">Try adjusting your filters</div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mb-10 flex items-center justify-between">
            <span className="text-[12px] text-[var(--poli-sub)]">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex gap-2">
              {safePage > 1 && (
                <Link href={buildUrl({ page: String(safePage - 1) })} className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] px-3.5 py-2 text-sm font-semibold text-[var(--poli-text)] no-underline">
                  Previous
                </Link>
              )}
              {safePage < totalPages && (
                <Link href={buildUrl({ page: String(safePage + 1) })} className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] px-3.5 py-2 text-sm font-semibold text-[var(--poli-text)] no-underline">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
