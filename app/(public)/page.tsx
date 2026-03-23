import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchInput } from '@/components/directory/search-input'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { Trending } from '@/components/directory/trending'
import { PARTY_EXPLAINERS } from '@/lib/data/educational-content'
import { getSiteSettings } from '@/lib/utils/site-settings'

export const revalidate = 1800 // 30 minutes

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title: s.homepage_title,
    description: s.homepage_description,
  }
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

  // Quick stats
  const [demRes, gopRes, indRes] = await Promise.all([
    supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('party', 'democrat'),
    supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('party', 'republican'),
    supabase.from('politicians').select('id', { count: 'exact', head: true }).not('party', 'in', '("democrat","republican")'),
  ])

  const dem = demRes.count ?? 0
  const gop = gopRes.count ?? 0
  const ind = indRes.count ?? 0
  const total = dem + gop + ind

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* Hero */}
        <div className="mb-10 max-w-[740px]">
          <h1 className="mb-5 animate-fade-up text-[clamp(36px,5vw,60px)] font-bold leading-[1.08]">
            Track Every Politician in America
          </h1>
          <p className="max-w-[520px] animate-fade-up text-[15.5px] leading-[1.7] text-[var(--codex-subtle)]">
            Search {total.toLocaleString()} officials. Compare stances. See who represents you.
          </p>
        </div>

        {/* Search — hero element */}
        <Suspense>
          <div className="mb-10 animate-fade-up">
            <SearchInput size="lg" />
          </div>
        </Suspense>

        {/* Party stats — 3 colored cards */}
        <div className="mb-12 grid animate-fade-up grid-cols-3 gap-3">
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${partyColor('democrat')}12` }}>
            <div className="flex items-center justify-center gap-2">
              <PartyIcon party="democrat" size={16} />
              <span className="text-2xl font-bold" style={{ color: partyColor('democrat') }}>{dem.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-[12px] font-medium text-[var(--codex-sub)]">Democrats</div>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${partyColor('republican')}12` }}>
            <div className="flex items-center justify-center gap-2">
              <PartyIcon party="republican" size={16} />
              <span className="text-2xl font-bold" style={{ color: partyColor('republican') }}>{gop.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-[12px] font-medium text-[var(--codex-sub)]">Republicans</div>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${partyColor('independent')}12` }}>
            <div className="flex items-center justify-center gap-2">
              <PartyIcon party="independent" size={16} />
              <span className="text-2xl font-bold" style={{ color: partyColor('independent') }}>{ind.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-[12px] font-medium text-[var(--codex-sub)]">Independents</div>
          </div>
        </div>

        {/* Quick Actions — above the fold */}
        <div className="mb-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/quiz" className="group rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all hover:shadow-md hover:border-[var(--codex-text)]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div className="text-[15px] font-bold text-[var(--codex-text)]">Who Represents You?</div>
              <p className="mt-1 text-[12px] text-[var(--codex-faint)]">Discover officials who align with your views</p>
            </Link>
            <Link href="/compare" className="group rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all hover:shadow-md hover:border-[var(--codex-text)]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div className="text-[15px] font-bold text-[var(--codex-text)]">Compare Officials</div>
              <p className="mt-1 text-[12px] text-[var(--codex-faint)]">Side-by-side on issues, finance, and votes</p>
            </Link>
            <Link href="/issues" className="group rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all hover:shadow-md hover:border-[var(--codex-text)]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div className="text-[15px] font-bold text-[var(--codex-text)]">Explore Issues</div>
              <p className="mt-1 text-[12px] text-[var(--codex-faint)]">See where every politician stands on key topics</p>
            </Link>
            <Link href="/elections" className="group rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all hover:shadow-md hover:border-[var(--codex-text)]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div className="text-[15px] font-bold text-[var(--codex-text)]">Track Elections</div>
              <p className="mt-1 text-[12px] text-[var(--codex-faint)]">Follow races and candidates across the country</p>
            </Link>
          </div>
        </div>

        {/* Trending — only renders if enough follows */}
        <Trending minTotalFollows={10} />

        {/* Featured Officials */}
        <div className="mb-12">
          <h2 className="mb-5 text-sm font-semibold text-[var(--codex-sub)]">
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
                  style={{ borderLeftWidth: '4px', borderLeftColor: color }}
                >
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
                      <div className="truncate text-[15px] font-semibold text-[var(--codex-text)] transition-colors group-hover:text-[var(--codex-text)]">
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

        <Footer />
      </div>
    </>
  )
}
