import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { StatsBar } from '@/components/directory/stats-bar'
import { SearchInput } from '@/components/directory/search-input'
import { ChamberTabs } from '@/components/directory/chamber-tabs'
import { PoliticianList } from '@/components/directory/politician-list'
import { StateFilter } from '@/components/filters/state-filter'
import { PartyFilter } from '@/components/filters/party-filter'
import { SortFilter } from '@/components/filters/sort-filter'
import type { Politician } from '@/lib/types/politician'
import { computeAlignment } from '@/lib/utils/alignment'
import { stanceBucket } from '@/lib/utils/stances'

export const metadata: Metadata = {
  title: 'Codex - U.S. Politician Directory & Civic Engagement Platform',
  description: 'Track U.S. politicians, their stances on issues, voting records, campaign finance, and elections. Transparent, data-driven political information for voters.',
  openGraph: {
    title: 'Codex - U.S. Politician Directory',
    description: 'Track U.S. politicians, their stances on issues, voting records, campaign finance, and elections.',
    url: 'https://codexapp.org',
    type: 'website',
  },
}

interface PageProps {
  searchParams: Promise<{ q?: string; chamber?: string; state?: string; party?: string; sort?: string; page?: string }>
}

const SORT_OPTIONS = [
  { key: 'name', label: 'Name A–Z' },
  { key: 'name-desc', label: 'Name Z–A' },
  { key: 'state', label: 'State A–Z' },
]

const PAGE_SIZE = 50

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  // Build filtered query
  let query = supabase.from('politicians').select('*', { count: 'exact' })

  if (params.chamber && params.chamber !== 'all') {
    query = query.eq('chamber', params.chamber)
  }
  if (params.state) {
    query = query.eq('state', params.state)
  }
  if (params.party) {
    query = query.eq('party', params.party)
  }
  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,state.ilike.%${params.q}%,title.ilike.%${params.q}%`
    )
  }

  const sort = params.sort ?? 'name'
  if (sort === 'name-desc') {
    query = query.order('name', { ascending: false })
  } else if (sort === 'state') {
    query = query.order('state').order('name')
  } else {
    query = query.order('name')
  }

  // Paginate
  query = query.range(offset, offset + PAGE_SIZE - 1)

  // Run page query + stats in parallel
  const [pageResult, demR, gopR, indR, totalR, chamberR] = await Promise.all([
    query,
    supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('party', 'democrat'),
    supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('party', 'republican'),
    supabase.from('politicians').select('id', { count: 'exact', head: true }).not('party', 'in', '("democrat","republican")'),
    supabase.from('politicians').select('id', { count: 'exact', head: true }),
    supabase.from('politicians').select('chamber'),
  ])

  const politicians = (pageResult.data ?? []) as Politician[]
  const totalCount = pageResult.count ?? 0

  // Fetch stances ONLY for visible politicians (max 50)
  const visibleIds = politicians.map(p => p.id)
  let stancesData: { politician_id: string; stance: string; issues: { slug: string } | null }[] = []
  if (visibleIds.length > 0) {
    const { data } = await supabase
      .from('politician_issues')
      .select('politician_id, stance, issues:issue_id(slug)')
      .in('politician_id', visibleIds)
    stancesData = (data ?? []) as unknown as typeof stancesData
  }

  // Build per-politician stance data
  const stancesByPol = new Map<string, { supports: number; opposes: number; mixed: number; stances: typeof stancesData }>()
  for (const s of stancesData) {
    if (!stancesByPol.has(s.politician_id)) {
      stancesByPol.set(s.politician_id, { supports: 0, opposes: 0, mixed: 0, stances: [] })
    }
    const entry = stancesByPol.get(s.politician_id)!
    const bucket = stanceBucket(s.stance)
    if (bucket === 'supports') entry.supports++
    else if (bucket === 'opposes') entry.opposes++
    else entry.mixed++
    entry.stances.push(s)
  }

  // Compute alignment
  const alignmentMap = new Map<string, number>()
  for (const pol of politicians) {
    const data = stancesByPol.get(pol.id)
    if (data) {
      alignmentMap.set(pol.id, computeAlignment(pol.party, data.stances))
    }
  }

  // Stats from parallel queries above
  const demCount = demR.count ?? 0
  const gopCount = gopR.count ?? 0
  const indCount = indR.count ?? 0
  const totalOfficials = totalR.count ?? 0
  const chamberCounts: Record<string, number> = {}
  if (chamberR.data) {
    for (const row of chamberR.data) {
      chamberCounts[row.chamber] = (chamberCounts[row.chamber] || 0) + 1
    }
  }

  const hasFilters = !!(params.q || params.chamber || params.state || params.party)
  const hasMorePages = offset + PAGE_SIZE < totalCount

  // Build stances/alignments as plain objects for client component
  const stancesObj: Record<string, { supports: number; opposes: number; mixed: number }> = {}
  const alignmentsObj: Record<string, number> = {}
  for (const pol of politicians) {
    const data = stancesByPol.get(pol.id)
    if (data) stancesObj[pol.id] = { supports: data.supports, opposes: data.opposes, mixed: data.mixed }
    const a = alignmentMap.get(pol.id)
    if (a !== undefined) alignmentsObj[pol.id] = a
  }

  const filterParams: Record<string, string> = {}
  if (params.q) filterParams.q = params.q
  if (params.chamber) filterParams.chamber = params.chamber
  if (params.state) filterParams.state = params.state
  if (params.party) filterParams.party = params.party
  if (params.sort) filterParams.sort = params.sort

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Codex',
    url: 'https://codexapp.org',
    description: 'Track U.S. politicians, their stances on issues, voting records, campaign finance, and elections.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://codexapp.org/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Hero */}
        <div className="mb-13 max-w-[740px]">
          <h1 className="mb-5 animate-fade-up font-serif text-[clamp(40px,5.5vw,68px)] font-normal leading-[1.05]">
            Every elected official.{' '}
            <span className="italic text-[var(--codex-subtle)]">One directory.</span>
          </h1>
          <p className="max-w-[500px] animate-fade-up text-[15.5px] leading-[1.7] text-[var(--codex-subtle)]">
            Biographies, official websites, campaign links, and donation pages for current U.S.
            politicians and candidates.
          </p>
        </div>

        <StatsBar
          politicians={[
            ...Array(demCount).fill({ party: 'democrat' }),
            ...Array(gopCount).fill({ party: 'republican' }),
            ...Array(indCount).fill({ party: 'independent' }),
          ] as Politician[]}
        />

        <Suspense>
          <SearchInput />
        </Suspense>

        {/* Filter bar */}
        <Suspense>
          <div className="mb-6 flex animate-fade-up flex-wrap items-center gap-3">
            <PartyFilter />
            <div className="h-5 w-px bg-[var(--codex-border)]" />
            <StateFilter />
            <div className="ml-auto">
              <SortFilter options={SORT_OPTIONS} defaultSort="name" />
            </div>
          </div>
        </Suspense>

        <Suspense>
          <ChamberTabs chamberCounts={chamberCounts} />
        </Suspense>

        {/* Table header */}
        <div className="grid animate-fade-up grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-[var(--codex-border)] px-3 pb-2.5">
          <span />
          <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--codex-faint)]">
            Official
          </span>
          <span className="hidden text-right text-[11px] uppercase tracking-[0.12em] text-[var(--codex-faint)] sm:block">
            Chamber
          </span>
        </div>

        {hasFilters && (
          <div className="px-3 pt-3 text-[11px] text-[var(--codex-faint)]" aria-live="polite" aria-atomic="true">
            {totalCount} result{totalCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Infinite scroll list */}
        <PoliticianList
          initialPoliticians={politicians}
          initialStances={stancesObj}
          initialAlignments={alignmentsObj}
          totalCount={totalCount}
          filterParams={filterParams}
          hasMore={hasMorePages}
        />

        <Footer />
      </div>
    </>
  )
}
