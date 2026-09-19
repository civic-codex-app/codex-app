import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchInput } from '@/components/directory/search-input'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { Trending } from '@/components/directory/trending'
import { HotTopics } from '@/components/home/hot-topics'
import { PersonalStrip } from '@/components/home/personal-strip'
import { SignoutToast } from '@/components/ui/signout-toast'
import { PARTY_EXPLAINERS } from '@/lib/data/educational-content'
import { getSiteSettings } from '@/lib/utils/site-settings'

const FEATURED_SLUGS = [
  'donald-trump',
  'nancy-pelosi',
  'ted-cruz',
  'chuck-schumer',
  'bernie-sanders',
  'jd-vance-vp',
]

/** The six featured officials, in display order. Cached: the list is a constant. */
const getFeatured = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient()
    const { data } = await supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, title, image_url')
      .in('slug', FEATURED_SLUGS)
    const bySlug = new Map((data ?? []).map((p) => [p.slug, p]))
    return FEATURED_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean) as NonNullable<typeof data>
  },
  ['home-featured-politicians'],
  { revalidate: 1800, tags: ['politicians'] }
)

/**
 * Party headcounts for the hero. Three count:exact scans over 8,617 rows to
 * produce three numbers that change when a politician is added, which was
 * happening on every render. Same idiom as getFacetRows in directory/page.tsx.
 */
const getPartyTallies = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient()
    const [demRes, gopRes, indRes] = await Promise.all([
      supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('party', 'democrat'),
      supabase.from('politicians').select('id', { count: 'exact', head: true }).eq('party', 'republican'),
      supabase.from('politicians').select('id', { count: 'exact', head: true }).not('party', 'in', '("democrat","republican")'),
    ])
    return { dem: demRes.count ?? 0, gop: gopRes.count ?? 0, ind: indRes.count ?? 0 }
  },
  ['home-party-tallies'],
  { revalidate: 1800, tags: ['politicians'] }
)
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

  const [featured, { dem, gop, ind }] = await Promise.all([getFeatured(), getPartyTallies()])
  const total = dem + gop + ind

  return (
    <>
      <Header />
      <Suspense><SignoutToast /></Suspense>
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* Hero */}
        <div className="mb-10 max-w-[740px]">
          <h1 className="mb-5 animate-fade-up text-[clamp(36px,5vw,60px)] font-bold leading-[1.08]">
            Track Every Politician in America
          </h1>
          <p className="max-w-[520px] animate-fade-up text-[15.5px] leading-[1.7] text-[var(--poli-subtle)]">
            Search {total.toLocaleString()} officials. Compare stances. See who represents you.
          </p>
        </div>

        {/* Search — hero element */}
        <Suspense>
          <div className="mb-10 animate-fade-up">
            <SearchInput size="lg" />
          </div>
        </Suspense>

        {/* Party stats — 3 colored cards, each filtering the directory by party */}
        <div className="mb-12 grid animate-fade-up grid-cols-3 gap-3">
          <Link
            href="/directory?party=democrat"
            aria-label={`Browse ${dem.toLocaleString()} Democrats`}
            className="rounded-lg p-4 text-center no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ backgroundColor: `${partyColor('democrat')}12` }}
          >
            <div className="flex items-center justify-center gap-2">
              <PartyIcon party="democrat" size={16} />
              <span className="text-2xl font-bold" style={{ color: partyColor('democrat') }}>{dem.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-[12px] font-medium text-[var(--poli-sub)]">Democrats</div>
          </Link>
          <Link
            href="/directory?party=republican"
            aria-label={`Browse ${gop.toLocaleString()} Republicans`}
            className="rounded-lg p-4 text-center no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ backgroundColor: `${partyColor('republican')}12` }}
          >
            <div className="flex items-center justify-center gap-2">
              <PartyIcon party="republican" size={16} />
              <span className="text-2xl font-bold" style={{ color: partyColor('republican') }}>{gop.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-[12px] font-medium text-[var(--poli-sub)]">Republicans</div>
          </Link>
          <Link
            href="/directory?party=independent"
            aria-label={`Browse ${ind.toLocaleString()} Independents`}
            className="rounded-lg p-4 text-center no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ backgroundColor: `${partyColor('independent')}12` }}
          >
            <div className="flex items-center justify-center gap-2">
              <PartyIcon party="independent" size={16} />
              <span className="text-2xl font-bold" style={{ color: partyColor('independent') }}>{ind.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-[12px] font-medium text-[var(--poli-sub)]">Independents</div>
          </Link>
        </div>

        {/* Signed-in extras, fetched on the client. Below the party cards so a
            post-hydration insert never pushes the fold down for the signed-out
            majority. See components/home/personal-strip.tsx. */}
        <PersonalStrip />

        {/* Quick Actions — above the fold */}
        <div className="mb-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/quiz" className="group flex items-center gap-4 rounded-lg border border-transparent p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--poli-border)]">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div className="text-[15px] font-bold text-[var(--poli-text)]">Who Represents You?</div>
                <p className="mt-1 text-[12px] text-[var(--poli-faint)]">Discover officials who align with your views</p>
              </div>
              <svg className="ml-auto shrink-0 text-[var(--poli-faint)] transition-colors group-hover:text-[var(--poli-text)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/compare" className="group flex items-center gap-4 rounded-lg border border-transparent p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--poli-border)]">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
                <div className="text-[15px] font-bold text-[var(--poli-text)]">Compare Officials</div>
                <p className="mt-1 text-[12px] text-[var(--poli-faint)]">Side-by-side on issues, finance, and votes</p>
              </div>
              <svg className="ml-auto shrink-0 text-[var(--poli-faint)] transition-colors group-hover:text-[var(--poli-text)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/issues" className="group flex items-center gap-4 rounded-lg border border-transparent p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--poli-border)]">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div className="text-[15px] font-bold text-[var(--poli-text)]">Explore Issues</div>
                <p className="mt-1 text-[12px] text-[var(--poli-faint)]">See where every politician stands on key topics</p>
              </div>
              <svg className="ml-auto shrink-0 text-[var(--poli-faint)] transition-colors group-hover:text-[var(--poli-text)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/elections" className="group flex items-center gap-4 rounded-lg border border-transparent p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--poli-border)]">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div className="text-[15px] font-bold text-[var(--poli-text)]">Track Elections</div>
                <p className="mt-1 text-[12px] text-[var(--poli-faint)]">Follow races and candidates across the country</p>
              </div>
              <svg className="ml-auto shrink-0 text-[var(--poli-faint)] transition-colors group-hover:text-[var(--poli-text)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>

        {/* Hot Topics — top issues with politician stances */}
        <Suspense>
          {/* followedIssueIds only re-ordered followed topics to the front. It
              cost the whole page its cache to know them, which is not a trade
              worth making for a sort order. */}
          <HotTopics />
        </Suspense>

        {/* Trending — only renders if enough follows */}
        <Trending minTotalFollows={10} />

        {/* Featured Officials */}
        <div className="mb-12">
          <h2 className="mb-5 text-sm font-semibold text-[var(--poli-sub)]">
            Featured Officials
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((pol) => {
              const color = partyColor(pol.party)
              return (
                <Link
                  key={pol.id}
                  href={`/politicians/${pol.slug}`}
                  className="group flex overflow-hidden rounded-xl no-underline transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ backgroundColor: `${color}08`, border: `1.5px solid ${color}22` }}
                >
                  <div className="w-[80px] flex-shrink-0 overflow-hidden bg-[var(--poli-card)]">
                    <AvatarImage
                      src={pol.image_url}
                      alt={pol.name}
                      size={80}
                      party={pol.party}
                      fallbackColor={color}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 px-4 py-3">
                    <div className="truncate text-lg font-semibold text-[var(--poli-text)]">
                      {pol.name}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <PartyIcon party={pol.party} size={12} />
                      <span className="text-[12px] text-[var(--poli-sub)]">{pol.state}</span>
                    </div>
                    <div className="mt-1 text-sm text-[var(--poli-faint)]">
                      {pol.title ?? (CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber)}
                      </div>
                    </div>
                </Link>
              )
            })}
          </div>
        </div>

        <Footer />

        {/* Mobile disclaimer — footer is hidden on mobile */}
        <div className="mt-8 pb-24 sm:hidden">
          <p className="text-[11px] leading-relaxed text-[var(--poli-faint)]">
            Poli is currently in beta. We are an independent civic education platform, not affiliated with any political party, campaign, or government agency.
            All data is compiled from public sources and may contain errors.{' '}
            <a href="/data-sources" className="underline hover:text-[var(--poli-sub)]">
              Data sources & disclaimer.
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
