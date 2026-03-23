import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient } from '@/lib/supabase/server'
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

  // Check if user is authenticated and fetch personalized data
  type UserProfile = { state: string | null; quiz_answers: Record<string, string> | null; quiz_results: unknown }
  let userProfile: UserProfile | null = null
  let userRepresentatives: { id: string; name: string; slug: string; party: string; state: string; chamber: string; title: string; image_url: string | null }[] = []
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('state, quiz_answers, quiz_results')
        .eq('id', user.id)
        .single()
      if (profile) {
        userProfile = profile as unknown as UserProfile
        // Fetch representatives for the user's state
        if (profile.state) {
          const { data: reps } = await supabase
            .from('politicians')
            .select('id, name, slug, party, state, chamber, title, image_url')
            .eq('state', profile.state)
            .in('chamber', ['senate', 'house', 'governor'])
            .order('chamber')
            .limit(20)
          userRepresentatives = reps ?? []
        }
      }
    }
  } catch {
    // Not authenticated or profile fetch failed — show anonymous view
  }

  // Featured politicians — most likely searched (top federal officials)
  const FEATURED_SLUGS = [
    'donald-trump',
    'nancy-pelosi',
    'ted-cruz',
    'chuck-schumer',
    'bernie-sanders',
    'jd-vance-vp',
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

        {/* Personalized section for authenticated users */}
        {userProfile && (
          <div className="mb-10 space-y-4 animate-fade-up">
            {/* Quick links */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--codex-border)] px-4 py-2 text-[13px] font-medium text-[var(--codex-sub)] no-underline transition-all hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Dashboard
              </Link>
              <Link
                href="/ballot"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--codex-border)] px-4 py-2 text-[13px] font-medium text-[var(--codex-sub)] no-underline transition-all hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                My Ballot
              </Link>
            </div>

            {/* Your Representatives */}
            {userRepresentatives.length > 0 && (
              <div className="rounded-xl border border-[var(--codex-border)] p-5">
                <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
                  Your Representatives
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {userRepresentatives.map((rep) => {
                    const repColor = partyColor(rep.party)
                    return (
                      <Link
                        key={rep.id}
                        href={`/politicians/${rep.slug}`}
                        className="group flex items-center gap-3 rounded-lg border border-[var(--codex-border)] p-3 no-underline transition-all hover:border-[var(--codex-text)] hover:shadow-sm"
                      >
                        <div
                          className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--codex-card)]"
                          style={{ border: `1.5px solid ${repColor}33` }}
                        >
                          <AvatarImage
                            src={rep.image_url}
                            alt={rep.name}
                            size={44}
                            party={rep.party}
                            fallbackColor={repColor}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold text-[var(--codex-text)]">
                            {rep.name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <PartyIcon party={rep.party} size={10} />
                            <span className="text-[11px] text-[var(--codex-faint)]">
                              {CHAMBER_LABELS[rep.chamber as ChamberKey] ?? rep.chamber}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quiz results prompt */}
            {userProfile.quiz_answers && Object.keys(userProfile.quiz_answers).length > 0 ? (
              <Link
                href="/quiz"
                className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 no-underline transition-all hover:border-blue-500/40"
              >
                <div>
                  <div className="text-[14px] font-semibold text-[var(--codex-text)]">Your Top Matches</div>
                  <div className="text-[12px] text-[var(--codex-sub)]">See which officials align with your views</div>
                </div>
                <svg className="shrink-0 text-blue-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            ) : (
              <Link
                href="/quiz"
                className="flex items-center justify-between rounded-xl border border-[var(--codex-border)] bg-[var(--codex-hover)] p-4 no-underline transition-all hover:border-[var(--codex-text)]"
              >
                <div>
                  <div className="text-[14px] font-semibold text-[var(--codex-text)]">Take the Quiz</div>
                  <div className="text-[12px] text-[var(--codex-sub)]">Find out which officials match your views</div>
                </div>
                <svg className="shrink-0 text-[var(--codex-faint)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            )}
          </div>
        )}

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
            <Link href="/quiz" className="group flex items-center gap-4 rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--codex-text)]">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div className="text-[15px] font-bold text-[var(--codex-text)]">Who Represents You?</div>
                <p className="mt-1 text-[12px] text-[var(--codex-faint)]">Discover officials who align with your views</p>
              </div>
              <svg className="ml-auto shrink-0 text-[var(--codex-faint)] transition-colors group-hover:text-[var(--codex-text)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/compare" className="group flex items-center gap-4 rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--codex-text)]">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
                <div className="text-[15px] font-bold text-[var(--codex-text)]">Compare Officials</div>
                <p className="mt-1 text-[12px] text-[var(--codex-faint)]">Side-by-side on issues, finance, and votes</p>
              </div>
              <svg className="ml-auto shrink-0 text-[var(--codex-faint)] transition-colors group-hover:text-[var(--codex-text)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/issues" className="group flex items-center gap-4 rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--codex-text)]">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div className="text-[15px] font-bold text-[var(--codex-text)]">Explore Issues</div>
                <p className="mt-1 text-[12px] text-[var(--codex-faint)]">See where every politician stands on key topics</p>
              </div>
              <svg className="ml-auto shrink-0 text-[var(--codex-faint)] transition-colors group-hover:text-[var(--codex-text)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/elections" className="group flex items-center gap-4 rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--codex-text)]">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div className="text-[15px] font-bold text-[var(--codex-text)]">Track Elections</div>
                <p className="mt-1 text-[12px] text-[var(--codex-faint)]">Follow races and candidates across the country</p>
              </div>
              <svg className="ml-auto shrink-0 text-[var(--codex-faint)] transition-colors group-hover:text-[var(--codex-text)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
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
                  className="group overflow-hidden rounded-xl border border-[var(--codex-border)] no-underline transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ backgroundColor: `${color}08` }}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div
                      className="h-[80px] w-[80px] flex-shrink-0 overflow-hidden rounded-xl bg-[var(--codex-card)]"
                      style={{ border: `2px solid ${color}33` }}
                    >
                      <AvatarImage
                        src={pol.image_url}
                        alt={pol.name}
                        size={80}
                        party={pol.party}
                        fallbackColor={color}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-semibold text-[var(--codex-text)]">
                        {pol.name}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <PartyIcon party={pol.party} size={12} />
                        <span className="text-[12px] text-[var(--codex-sub)]">{pol.state}</span>
                      </div>
                      <div className="mt-1 text-sm text-[var(--codex-faint)]">
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
