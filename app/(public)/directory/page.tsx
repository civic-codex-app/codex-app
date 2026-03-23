import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchInput } from '@/components/directory/search-input'
import { DirectoryFilters } from '@/components/directory/directory-filters'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { STATE_NAMES } from '@/lib/constants/us-states'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Browse Politicians | Poli',
  description: 'Search and filter 8,000+ U.S. elected officials by state, party, and level of government — from Congress to your local school board.',
}

interface PageProps {
  searchParams: Promise<{ state?: string; party?: string; chamber?: string; page?: string }>
}

const PAGE_SIZE = 50

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  // Fetch ALL politicians (lightweight: just filter fields) to compute facet counts
  // Then fetch the paginated results for display
  const [facetResult, pageResult] = await Promise.all([
    (async () => {
      const all: Array<{ party: string; chamber: string; state: string }> = []
      let from = 0
      while (true) {
        let q = supabase.from('politicians').select('party, chamber, state')
        // Apply current filters for cascading counts
        if (params.state) q = q.eq('state', params.state)
        if (params.party) q = q.eq('party', params.party)
        if (params.chamber) q = q.eq('chamber', params.chamber)
        q = q.range(from, from + 999)
        const { data } = await q
        if (!data || data.length === 0) break
        all.push(...data)
        if (data.length < 1000) break
        from += 1000
      }
      return all
    })(),
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

  // Also fetch unfiltered facets for dimensions NOT currently filtered
  // This lets us show counts for party options even when chamber is selected, etc.
  const [partyFacet, chamberFacet, stateFacet] = await Promise.all([
    // Party counts: apply chamber + state filters, but NOT party
    (async () => {
      const all: Array<{ party: string }> = []
      let from = 0
      while (true) {
        let q = supabase.from('politicians').select('party')
        if (params.state) q = q.eq('state', params.state)
        if (params.chamber) q = q.eq('chamber', params.chamber)
        q = q.range(from, from + 999)
        const { data } = await q
        if (!data || data.length === 0) break
        all.push(...data)
        if (data.length < 1000) break
        from += 1000
      }
      const counts: Record<string, number> = {}
      for (const p of all) counts[p.party] = (counts[p.party] || 0) + 1
      return counts
    })(),
    // Chamber counts: apply party + state filters, but NOT chamber
    (async () => {
      const all: Array<{ chamber: string }> = []
      let from = 0
      while (true) {
        let q = supabase.from('politicians').select('chamber')
        if (params.state) q = q.eq('state', params.state)
        if (params.party) q = q.eq('party', params.party)
        q = q.range(from, from + 999)
        const { data } = await q
        if (!data || data.length === 0) break
        all.push(...data)
        if (data.length < 1000) break
        from += 1000
      }
      const counts: Record<string, number> = {}
      for (const c of all) counts[c.chamber] = (counts[c.chamber] || 0) + 1
      return counts
    })(),
    // State counts: apply party + chamber filters, but NOT state
    (async () => {
      const all: Array<{ state: string }> = []
      let from = 0
      while (true) {
        let q = supabase.from('politicians').select('state')
        if (params.party) q = q.eq('party', params.party)
        if (params.chamber) q = q.eq('chamber', params.chamber)
        q = q.range(from, from + 999)
        const { data } = await q
        if (!data || data.length === 0) break
        all.push(...data)
        if (data.length < 1000) break
        from += 1000
      }
      const counts: Record<string, number> = {}
      for (const s of all) if (s.state) counts[s.state] = (counts[s.state] || 0) + 1
      return counts
    })(),
  ])

  const politicians = pageResult.data ?? []
  const totalCount = pageResult.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const filterCounts = {
    parties: partyFacet,
    chambers: chamberFacet,
    states: stateFacet,
  }

  function buildUrl(overrides: Record<string, string>) {
    const p: Record<string, string> = {}
    if (params.state) p.state = params.state
    if (params.party) p.party = params.party
    if (params.chamber) p.chamber = params.chamber
    Object.assign(p, overrides)
    if (p.page === '1') delete p.page
    const qs = new URLSearchParams(p).toString()
    return `/directory${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <h1 className="mb-1 font-serif text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          Directory
        </h1>
        <p className="mb-6 text-[14px] text-[var(--codex-sub)]">
          {totalCount.toLocaleString()} official{totalCount !== 1 ? 's' : ''}
        </p>

        <Suspense>
          <SearchInput basePath="/directory" />
        </Suspense>

        <Suspense>
          <DirectoryFilters counts={filterCounts} stateNames={STATE_NAMES} />
        </Suspense>

        {/* Results */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {politicians.map((pol) => {
            const color = partyColor(pol.party)
            return (
              <Link
                key={pol.id}
                href={`/politicians/${pol.slug}`}
                className="group flex overflow-hidden rounded-xl no-underline transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: `${color}08`, border: `1.5px solid ${color}22` }}
              >
                <div className="w-[68px] flex-shrink-0 self-stretch overflow-hidden bg-[var(--codex-card)]">
                  <AvatarImage
                    src={pol.image_url}
                    alt={pol.name}
                    size={136}
                    party={pol.party}
                    fallbackColor={color}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0 flex-1 px-4 py-3">
                  <div className="truncate text-[15px] font-semibold text-[var(--codex-text)]">
                    {pol.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {pol.image_url && <PartyIcon party={pol.party} size={12} />}
                    <span className="text-[12px] text-[var(--codex-sub)]">{pol.state}</span>
                  </div>
                  <div className="mt-1 truncate text-[12px] text-[var(--codex-faint)]">
                    {pol.title ?? (CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber)}
                  </div>
                </div>
              </Link>
            )
          })}

          {politicians.length === 0 && (
            <div className="py-16 text-center text-[var(--codex-faint)]">
              <div className="mb-2 text-xl font-semibold">No officials found</div>
              <div className="text-sm">Try adjusting your filters</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mb-10 flex items-center justify-between">
            <span className="text-[11px] text-[var(--codex-faint)]">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex gap-2">
              {safePage > 1 && (
                <Link
                  href={buildUrl({ page: String(safePage - 1) })}
                  className="rounded-md border border-[var(--codex-border)] px-3 py-1.5 text-sm text-[var(--codex-sub)] no-underline hover:bg-[var(--codex-hover)]"
                >
                  Previous
                </Link>
              )}
              {safePage < totalPages && (
                <Link
                  href={buildUrl({ page: String(safePage + 1) })}
                  className="rounded-md border border-[var(--codex-border)] px-3 py-1.5 text-sm text-[var(--codex-sub)] no-underline hover:bg-[var(--codex-hover)]"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
