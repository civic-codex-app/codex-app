import { Suspense } from 'react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AppShell } from '@/components/app/surface'
import { HomeTop } from '@/components/home/home-top'
import { BallotCard } from '@/components/home/ballot-card'
import { DeadlineRow } from '@/components/home/deadline-row'
import { BillsMoving, type BillCard } from '@/components/home/bills-moving'
import type { WallFace } from '@/components/home/arrival'
import { SignoutToast } from '@/components/ui/signout-toast'
import { getSiteSettings } from '@/lib/utils/site-settings'
import { getNextElection, countdown } from '@/lib/utils/next-election'

/**
 * Home — "Your government".
 *
 * Reads nothing per-request: no cookies, no headers, no searchParams, so the
 * whole page prerenders and is served from cache. The parts that vary by
 * visitor — who represents them, which races are theirs — are client islands
 * that resolve after hydration from a ZIP held in the profile or in
 * localStorage (lib/hooks/use-location.ts). That is what keeps this route at
 * a cache HIT instead of a full render per view.
 *
 * Before a ZIP is known the top of the page is the Arrival screen: a wall of
 * real faces and one field. After, it is the four officials with what each is
 * doing in the next election, the countdown with the visitor's own races, the
 * next deadline in Congress (stated by an admin in Site Settings, since no
 * table records one), and the latest bills.
 *
 * Everything on this screen is a real value from the database. Things the
 * design drew that are deliberately absent, because nothing behind them
 * exists: per-rep vote chips (voting_records holds 0 rows), "Registered ✓"
 * (no registration source), "3 of 7 races decided" (no per-user record).
 */

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title: `${s.site_name} | ${s.site_tagline}`,
    description: s.site_description,
  }
}

/**
 * The bills that moved most recently.
 *
 * Ordered by last_action_date. Only bills carrying a CRS summary are asked
 * for: the row leads with the summary's opening sentence, and one without a
 * summary falls back to its official title, which reads as a different kind of
 * row next to the others.
 */
const getMovingBills = unstable_cache(
  async (): Promise<BillCard[]> => {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('bills')
      .select('id, number, title, summary, status, last_action_date')
      .not('summary', 'is', null)
      .order('last_action_date', { ascending: false, nullsFirst: false })
      .limit(4)
    if (error) {
      console.error('[home] bills unavailable:', error.message)
      return []
    }
    return (data ?? []) as BillCard[]
  },
  ['home-moving-bills'],
  { revalidate: 1800, tags: ['bills'] }
)

/**
 * Faces for the Arrival wall: sitting senators with a photo on file, which
 * Congress.gov has verified as serving. Eighteen, spread across the alphabet
 * so the wall is not a run of one state, and the same eighteen for everyone
 * so the prerendered HTML is stable.
 */
const getWallFaces = unstable_cache(
  async (): Promise<WallFace[]> => {
    const supabase = createServiceRoleClient()
    const { data } = await supabase
      .from('politicians')
      .select('name, image_url')
      .eq('chamber', 'senate')
      .eq('is_verified', true)
      .not('image_url', 'is', null)
      .order('name')
      .limit(90)
    const rows = (data ?? []) as Array<{ name: string; image_url: string }>
    if (rows.length <= 18) return rows.map((r) => ({ src: r.image_url, alt: r.name }))
    const step = rows.length / 18
    return Array.from({ length: 18 }, (_, i) => rows[Math.floor(i * step)]).map((r) => ({ src: r.image_url, alt: r.name }))
  },
  ['home-wall-faces'],
  { revalidate: 86400, tags: ['politicians'] }
)

export default async function HomePage() {
  const [election, bills, faces, settings] = await Promise.all([
    getNextElection(),
    getMovingBills(),
    getWallFaces(),
    getSiteSettings(),
  ])

  // Rendered on the server, so it is the deploy's date rather than the
  // viewer's. With revalidate at 30 minutes it is never more than that stale,
  // and it avoids a hydration mismatch against a client-side clock.
  const now = new Date()
  const today = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  // Whole days to the election, in UTC, computed once here so every island
  // shows the same number.
  const c = election ? countdown(election.date) : null
  const days = c?.days ?? 0
  const when = c?.short ?? ''
  const electionLine = c ? `Election Day · ${c.bare} · ${c.days} day${c.days === 1 ? '' : 's'}` : null

  return (
    <AppShell>
      {/* useSearchParams inside, which opts a client component out of static
          prerendering and takes the whole page with it. The Suspense boundary
          is what keeps / prerendered. */}
      <Suspense fallback={null}>
        <SignoutToast />
      </Suspense>
      <div className="mx-auto max-w-[560px] px-4 pt-5">
        <HomeTop today={today} faces={faces} electionLine={electionLine} />

        {election && <BallotCard days={days} when={when} raceCount={election.raceCount} />}

        <DeadlineRow settings={settings} />

        <BillsMoving bills={bills} />
      </div>
    </AppShell>
  )
}
