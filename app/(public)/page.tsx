import { Suspense } from 'react'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AppShell } from '@/components/app/surface'
import { YourReps } from '@/components/home/your-reps'
import { BallotCountdown } from '@/components/home/ballot-countdown'
import { BillsMoving, type BillCard } from '@/components/home/bills-moving'
import { SignoutToast } from '@/components/ui/signout-toast'
import { getSiteSettings } from '@/lib/utils/site-settings'

/**
 * Home — "Your government".
 *
 * Reads nothing per-request: no cookies, no headers, no searchParams, so the
 * whole page prerenders and is served from cache. The one part that varies by
 * visitor, the representatives list, is a client island that resolves after
 * hydration (components/home/your-reps.tsx). That is what keeps this route at
 * a cache HIT instead of a full render per view, which is what it used to be
 * before the auth cookie was removed from it.
 *
 * Everything on this screen is a real value from the database. Three things
 * the design drew are deliberately absent, because nothing behind them exists:
 *
 *   - the per-rep activity chip ("Voted YEA · 2h ago", "Missed 3 votes").
 *     voting_records holds 0 rows. Every vote-derived element in the mockup
 *     waits on a real roll-call import.
 *   - "Registered ✓ Confirmed". There is no voter-registration source here.
 *   - "3 of 7 races decided". There is no per-user record of ballot choices.
 *
 * They are listed here rather than quietly dropped so the next person knows
 * they were considered, and what would unblock each.
 */

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title: `${s.site_name} | ${s.site_tagline}`,
    description: s.site_description,
  }
}

/** The next election with a date, and how many races sit on it. */
const getNextElection = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient()
    const today = new Date().toISOString().slice(0, 10)
    // The soonest date across all active elections, and every race falling on
    // it. Not "the first election row": the 52 rows are per-state and share one
    // date, so taking row zero attached Alaska's name and Alaska's race count
    // to every visitor's ballot.
    const { data: elections } = await supabase
      .from('elections')
      .select('id, election_date')
      .eq('is_active', true)
      .gte('election_date', today)
      .order('election_date')
    if (!elections?.length) return null
    const date = elections[0].election_date as string
    const sameDay = elections.filter((e) => e.election_date === date).map((e) => e.id)
    const { count } = await supabase
      .from('races')
      .select('*', { count: 'exact', head: true })
      .in('election_id', sameDay)
    return { date, raceCount: count ?? 0 }
  },
  ['home-next-election'],
  { revalidate: 1800, tags: ['elections'] }
)

/**
 * The bills that moved most recently.
 *
 * Ordered by last_action_date, which is what "moving now" means. Only bills
 * carrying a CRS summary are asked for: the card leads with the summary's
 * opening sentence, and one without a summary falls back to its official
 * title, which reads as a different kind of card next to the others.
 */
const getMovingBills = unstable_cache(
  async (): Promise<BillCard[]> => {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('bills')
      .select('id, number, title, summary, status')
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

export default async function HomePage() {
  const [election, bills] = await Promise.all([getNextElection(), getMovingBills()])

  // Rendered on the server, so it is the deploy's date rather than the
  // viewer's. With revalidate at 30 minutes it is never more than that stale,
  // and it avoids a hydration mismatch against a client-side clock.
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <AppShell>
      {/* useSearchParams inside, which opts a client component out of static
          prerendering and takes the whole page with it. The Suspense boundary
          is what keeps / prerendered. */}
      <Suspense fallback={null}>
        <SignoutToast />
      </Suspense>
      <div className="mx-auto max-w-[560px] px-4 pt-5">
        <header className="mb-5 px-1">
          <p className="mb-1 text-[13px] font-medium text-[var(--poli-sub)]">{today}</p>
          <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--poli-text)]">
            Your government
          </h1>
        </header>

        <YourReps />

        {election && (
          <BallotCountdown date={election.date} raceCount={election.raceCount} />
        )}

        <BillsMoving bills={bills} />
      </div>
    </AppShell>
  )
}
