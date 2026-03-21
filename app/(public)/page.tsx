import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { StatsBar } from '@/components/directory/stats-bar'
import { SearchInput } from '@/components/directory/search-input'
import { ChamberTabs } from '@/components/directory/chamber-tabs'
import { PoliticianCard } from '@/components/directory/politician-card'
import { StateFilter } from '@/components/filters/state-filter'
import { PartyFilter } from '@/components/filters/party-filter'
import { SortFilter } from '@/components/filters/sort-filter'
import type { Politician } from '@/lib/types/politician'
import type { HomeStanceRow } from '@/lib/types/supabase'
import { computeAlignment } from '@/lib/utils/alignment'

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
  searchParams: Promise<{ q?: string; chamber?: string; state?: string; party?: string; sort?: string }>
}

const SORT_OPTIONS = [
  { key: 'name', label: 'Name A–Z' },
  { key: 'name-desc', label: 'Name Z–A' },
  { key: 'state', label: 'State A–Z' },
  { key: 'alignment', label: 'Alignment ↓' },
  { key: 'alignment-asc', label: 'Mavericks First' },
]

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  // Build query
  let query = supabase.from('politicians').select('*')

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
  if (sort !== 'alignment' && sort !== 'alignment-asc') {
    if (sort === 'name-desc') {
      query = query.order('name', { ascending: false })
    } else if (sort === 'state') {
      query = query.order('state').order('name')
    } else {
      query = query.order('name')
    }
  } else {
    query = query.order('name')
  }

  const { data: politicians, error: politiciansError } = await query
  if (politiciansError) console.error('Failed to fetch politicians:', politiciansError.message)

  if (!politicians) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 font-serif text-2xl text-[var(--codex-text)]">Something went wrong</div>
            <p className="text-sm text-[var(--codex-sub)]">
              We couldn&apos;t load the politician directory right now. Please try again later.
            </p>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  const { data: allPoliticians, error: allPoliticiansError } = await supabase
    .from('politicians')
    .select('id, party')
  if (allPoliticiansError) console.error('Failed to fetch all politicians:', allPoliticiansError.message)

  // Fetch all stances for enrichment — paginate past supabase 1000-row server limit
  const allStances: HomeStanceRow[] = []
  {
    let from = 0
    const PAGE = 1000
    while (true) {
      const { data } = await supabase
        .from('politician_issues')
        .select('politician_id, stance, issue_id, issues:issue_id(slug)')
        .range(from, from + PAGE - 1)
      if (!data || data.length === 0) break
      allStances.push(...(data as unknown as HomeStanceRow[]))
      if (data.length < PAGE) break
      from += PAGE
    }
  }

  // Build per-politician stance data
  const stancesByPol = new Map<
    string,
    {
      supports: number
      opposes: number
      mixed: number
      stances: Array<{ stance: string; issues: { slug: string } | null }>
    }
  >()
  for (const s of allStances) {
    if (!stancesByPol.has(s.politician_id)) {
      stancesByPol.set(s.politician_id, { supports: 0, opposes: 0, mixed: 0, stances: [] })
    }
    const entry = stancesByPol.get(s.politician_id)!
    if (['strongly_supports', 'supports', 'leans_support'].includes(s.stance)) entry.supports++
    else if (['strongly_opposes', 'opposes', 'leans_oppose'].includes(s.stance)) entry.opposes++
    else if (['mixed', 'neutral'].includes(s.stance)) entry.mixed++
    entry.stances.push({ stance: s.stance, issues: s.issues })
  }

  const all = (allPoliticians ?? []) as Pick<Politician, 'id' | 'party'>[]
  let filtered = (politicians ?? []) as Politician[]

  // Compute alignment for each politician
  const alignmentMap = new Map<string, number>()
  for (const pol of filtered) {
    const data = stancesByPol.get(pol.id)
    if (data) {
      alignmentMap.set(pol.id, computeAlignment(pol.party, data.stances))
    }
  }

  // Apply alignment sort
  if (sort === 'alignment') {
    filtered = [...filtered].sort(
      (a, b) => (alignmentMap.get(b.id) ?? -1) - (alignmentMap.get(a.id) ?? -1)
    )
  } else if (sort === 'alignment-asc') {
    filtered = [...filtered].sort(
      (a, b) => (alignmentMap.get(a.id) ?? 999) - (alignmentMap.get(b.id) ?? 999)
    )
  }

  const hasFilters = !!(params.q || params.chamber || params.state || params.party)

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

        <StatsBar politicians={all as Politician[]} />

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
          <ChamberTabs />
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
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* List */}
        <div className="animate-fade-up">
          {filtered.map((pol) => {
            const data = stancesByPol.get(pol.id)
            return (
              <PoliticianCard
                key={pol.id}
                politician={pol}
                alignment={alignmentMap.get(pol.id)}
                stances={
                  data
                    ? { supports: data.supports, opposes: data.opposes, mixed: data.mixed }
                    : undefined
                }
              />
            )
          })}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-[var(--codex-faint)]">
              <div className="mb-2 font-serif text-2xl">No results</div>
              <div className="text-sm">Try adjusting your filters or search query</div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  )
}
