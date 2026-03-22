import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchInput } from '@/components/directory/search-input'
import { ChamberTabs } from '@/components/directory/chamber-tabs'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'U.S. Politician Directory & Civic Engagement Platform',
  description: 'Track U.S. politicians, their stances on issues, voting records, campaign finance, and elections. Transparent, data-driven political information for voters.',
}

export default async function HomePage() {
  const supabase = createServiceRoleClient()

  // Featured politicians — most likely searched (top federal officials)
  const FEATURED_SLUGS = [
    'donald-trump',
    'jd-vance-vp',
    'bernie-sanders',
    'ted-cruz',
    'nancy-pelosi',
    'mitch-mcconnell',
  ]
  const { data: featuredData } = await supabase
    .from('politicians')
    .select('id, name, slug, party, state, chamber, title, image_url')
    .in('slug', FEATURED_SLUGS)

  // Maintain the display order
  const featuredMap = new Map((featuredData ?? []).map(p => [p.slug, p]))
  const featured = FEATURED_SLUGS.map(s => featuredMap.get(s)).filter(Boolean) as NonNullable<typeof featuredData>

  // Quick stats + chamber counts
  const chambers = ['senate', 'house', 'governor', 'presidential', 'state_senate', 'state_house'] as const
  const [totalRes, demRes, gopRes, indRes, ...chamberResults] = await Promise.all([
    supabase.from('politicians').select('id', { count: 'exact', head: true }),
    supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('party', 'democrat'),
    supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('party', 'republican'),
    supabase.from('politicians').select('id', { count: 'exact', head: true }).not('party', 'in', '("democrat","republican")'),
    ...chambers.map(ch => supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('chamber', ch)),
  ])
  const chamberCounts: Record<string, number> = {}
  for (let i = 0; i < chambers.length; i++) {
    const count = chamberResults[i].count ?? 0
    if (count > 0) chamberCounts[chambers[i]] = count
  }

  const total = totalRes.count ?? 0
  const dem = demRes.count ?? 0
  const gop = gopRes.count ?? 0
  const ind = indRes.count ?? 0

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Hero */}
        <div className="mb-12 max-w-[740px]">
          <h1 className="mb-5 animate-fade-up font-serif text-[clamp(40px,5.5vw,68px)] font-normal leading-[1.05]">
            Every elected official.{' '}
            <span className="italic text-[var(--codex-subtle)]">One directory.</span>
          </h1>
          <p className="max-w-[500px] animate-fade-up text-[15.5px] leading-[1.7] text-[var(--codex-subtle)]">
            Search {total.toLocaleString()} politicians. Compare stances, track voting records, and find your match.
          </p>
        </div>

        {/* Search */}
        <Suspense>
          <SearchInput />
        </Suspense>

        {/* Quick stats */}
        <div className="mb-12 grid animate-fade-up grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-[var(--codex-border)] p-4 text-center">
            <div className="font-serif text-2xl text-[var(--codex-text)]">{total.toLocaleString()}</div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Total Officials</div>
          </div>
          <div className="rounded-md border border-[var(--codex-border)] p-4 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <PartyIcon party="democrat" size={14} />
              <span className="font-serif text-2xl" style={{ color: partyColor('democrat') }}>{dem.toLocaleString()}</span>
            </div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Democratic</div>
          </div>
          <div className="rounded-md border border-[var(--codex-border)] p-4 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <PartyIcon party="republican" size={14} />
              <span className="font-serif text-2xl" style={{ color: partyColor('republican') }}>{gop.toLocaleString()}</span>
            </div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Republican</div>
          </div>
          <div className="rounded-md border border-[var(--codex-border)] p-4 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <PartyIcon party="independent" size={14} />
              <span className="font-serif text-2xl" style={{ color: partyColor('independent') }}>{ind.toLocaleString()}</span>
            </div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Independent</div>
          </div>
        </div>

        {/* Featured Officials */}
        <div className="mb-12">
          <h2 className="mb-5 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
            Featured Officials
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((pol) => {
              const color = partyColor(pol.party)
              return (
                <Link
                  key={pol.id}
                  href={`/politicians/${pol.slug}`}
                  className="group overflow-hidden rounded-lg border border-[var(--codex-border)] no-underline transition-all hover:border-[var(--codex-text)]"
                >
                  <div className="h-1" style={{ background: `${color}66` }} />
                  <div className="flex items-center gap-4 p-4">
                    <div
                      className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--codex-card)]"
                      style={{ border: `2px solid ${color}44` }}
                    >
                      <AvatarImage
                        src={pol.image_url}
                        alt={pol.name}
                        size={56}
                        party={pol.party}
                        fallbackColor={color}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-serif text-[15px] font-medium text-[var(--codex-text)] transition-colors group-hover:text-[var(--codex-text)]">
                        {pol.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--codex-sub)]">
                        <PartyIcon party={pol.party} size={10} />
                        <span style={{ color }}>{partyLabel(pol.party)}</span>
                        <span className="text-[var(--codex-faint)]">·</span>
                        <span>{pol.state}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--codex-faint)]">
                        {pol.title ?? (CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber)}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="mb-5 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
            Explore
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/match" className="rounded-md border border-[var(--codex-border)] p-4 no-underline transition-colors hover:border-[var(--codex-text)]">
              <div className="mb-1 font-serif text-[15px] text-[var(--codex-text)]">Voter Match</div>
              <p className="text-[12px] text-[var(--codex-faint)]">Find politicians who align with your views</p>
            </Link>
            <Link href="/compare" className="rounded-md border border-[var(--codex-border)] p-4 no-underline transition-colors hover:border-[var(--codex-text)]">
              <div className="mb-1 font-serif text-[15px] text-[var(--codex-text)]">Compare</div>
              <p className="text-[12px] text-[var(--codex-faint)]">Side-by-side on issues, finance, and votes</p>
            </Link>
            <Link href="/report-cards" className="rounded-md border border-[var(--codex-border)] p-4 no-underline transition-colors hover:border-[var(--codex-text)]">
              <div className="mb-1 font-serif text-[15px] text-[var(--codex-text)]">Civic Profiles</div>
              <p className="text-[12px] text-[var(--codex-faint)]">Activity scores for every politician</p>
            </Link>
            <Link href="/issues/map" className="rounded-md border border-[var(--codex-border)] p-4 no-underline transition-colors hover:border-[var(--codex-text)]">
              <div className="mb-1 font-serif text-[15px] text-[var(--codex-text)]">Issue Map</div>
              <p className="text-[12px] text-[var(--codex-faint)]">How each state leans on key issues</p>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}
