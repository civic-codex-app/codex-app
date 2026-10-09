import { unstable_cache } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * The next election with a date, and how many races sit on it.
 *
 * The soonest date across all active elections, and every race falling on
 * it. Not "the first election row": the 52 rows are per-state and share one
 * date, so taking row zero attached Alaska's name and Alaska's race count
 * to every visitor's ballot.
 */
export const getNextElection = unstable_cache(
  async (): Promise<{ date: string; raceCount: number } | null> => {
    const supabase = createServiceRoleClient()
    const today = new Date().toISOString().slice(0, 10)
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
 * Whole days until an ISO date, and the date spelled out, both in UTC so the
 * server-rendered number never disagrees with a viewer's clock.
 */
export function countdown(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const now = new Date()
  const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const target = Date.UTC(y, m - 1, d)
  const days = Math.max(0, Math.round((target - utcToday) / 86400000))
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Date(target).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })
  return {
    days,
    /** "Tue, Nov 3" */
    short: fmt({ weekday: 'short', month: 'short', day: 'numeric' }),
    /** "Tuesday, November 3" */
    long: fmt({ weekday: 'long', month: 'long', day: 'numeric' }),
    /** "Nov 3" */
    bare: fmt({ month: 'short', day: 'numeric' }),
  }
}
