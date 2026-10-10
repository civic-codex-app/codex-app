import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * What an official is doing in the next election, read from the tables rather
 * than guessed.
 *
 * The design labels each of "your four" with a word: Running again, Retiring,
 * Term-limited, Until 2031. Two of those words claim a reason we do not hold —
 * nothing in the schema says *why* a seat is open — so the honest vocabulary
 * is what the rows support:
 *
 *   running    a `candidates` row with status 'running' in the race for the
 *              seat they hold
 *   other_race status 'running' in a race for a different office
 *   lost       status 'lost' — did not survive the primary
 *   seat_open  no running row of theirs, but a race for their seat exists:
 *              retiring, term-limited, withdrawn, or simply not filed
 *   not_up     no race for their seat in any active election — a senator
 *              mid-term, a governor with no election this cycle
 *
 * "Their seat" is the race whose `incumbent_id` is them. That is the only
 * thing that tells one state's two Senate seats apart: matching on (state,
 * chamber) alone made every Michigan senator read "Seat open" the year one
 * of them retired. Where a race has no incumbent_id (152 do), House and
 * governor races fall back to (state, chamber, district); Senate races do
 * not, because the fallback cannot know which seat they are.
 *
 * Candidate rows come from the FEC import and the Michigan reconcile and are
 * only as complete as those are; a House member in a state whose candidates
 * were never imported reads as seat_open, which is why the label says "Seat
 * open" and not "Retiring".
 *
 * The FEC knows who filed, not who survived the primary. Until a race has
 * been reconciled against the state's certified listing
 * (races.ballot_confirmed_at, migration 032) the words are "Filed to run
 * again" and "Filed for Governor", and `confirmed` is false so the screens
 * can stop short of "on your ballot".
 */
export type CandidacyKind = 'running' | 'other_race' | 'lost' | 'seat_open' | 'not_up'

export interface Candidacy {
  kind: CandidacyKind
  label: string
  /** The race this status refers to, when there is one. */
  raceSlug: string | null
  raceName: string | null
  raceChamber: string | null
  /** That race's statuses were reconciled against the state's certified listing. */
  confirmed: boolean
}

interface Seat {
  id: string
  state: string | null
  chamber: string
  district?: string | null
}

const OFFICE: Record<string, string> = {
  senate: 'Senate',
  house: 'House',
  governor: 'Governor',
  presidential: 'President',
  state_senate: 'State Senate',
  state_house: 'State House',
  mayor: 'Mayor',
  city_council: 'City Council',
  county: 'County',
  school_board: 'School Board',
  other_local: 'local office',
}

type RaceRow = {
  id: string
  slug: string
  name: string
  state: string
  chamber: string
  district: string | null
  election_id: string
  incumbent_id: string | null
  ballot_confirmed_at: string | null
  candidates?: Array<{ status: string; is_incumbent: boolean; politician_id: string | null }>
}

function isSeatRace(race: RaceRow, seat: Seat): boolean {
  if (race.incumbent_id) return race.incumbent_id === seat.id
  if (race.chamber === 'senate') return false
  if (race.state !== seat.state || race.chamber !== seat.chamber) return false
  if (seat.chamber !== 'house') return true
  return String(race.district ?? '') === String(seat.district ?? '')
}

export async function candidacyFor(
  supabase: SupabaseClient,
  seats: Seat[]
): Promise<Map<string, Candidacy>> {
  const out = new Map<string, Candidacy>()
  if (!seats.length) return out

  const today = new Date().toISOString().slice(0, 10)
  const { data: elections } = await supabase
    .from('elections')
    .select('id')
    .eq('is_active', true)
    .gte('election_date', today)
  const electionIds = (elections ?? []).map((e) => e.id as string)
  if (!electionIds.length) {
    for (const s of seats) out.set(s.id, notUp())
    return out
  }

  const states = [...new Set(seats.map((s) => s.state).filter(Boolean))] as string[]
  const [{ data: candidateRows }, { data: seatRaces }] = await Promise.all([
    supabase
      .from('candidates')
      .select('politician_id, status, races:race_id(id, slug, name, state, chamber, district, election_id, incumbent_id, ballot_confirmed_at)')
      .in('politician_id', seats.map((s) => s.id)),
    supabase
      .from('races')
      .select('id, slug, name, state, chamber, district, election_id, incumbent_id, ballot_confirmed_at, candidates(status, is_incumbent, politician_id)')
      .in('election_id', electionIds)
      .in('state', states)
      .in('chamber', ['senate', 'house', 'governor', 'presidential']),
  ])

  const active = new Set(electionIds)
  const byPol = new Map<string, Array<{ status: string; race: RaceRow }>>()
  for (const row of (candidateRows ?? []) as unknown as Array<{ politician_id: string; status: string; races: RaceRow | null }>) {
    if (!row.races || !active.has(row.races.election_id)) continue
    const list = byPol.get(row.politician_id) ?? []
    list.push({ status: row.status, race: row.races })
    byPol.set(row.politician_id, list)
  }
  const races = (seatRaces ?? []) as RaceRow[]

  for (const seat of seats) {
    const mine = byPol.get(seat.id) ?? []
    const seatRace = races.find((r) => isSeatRace(r, seat)) ?? null
    const runningHere = mine.find((c) => c.status === 'running' && isSeatRace(c.race, seat))
    const runningElsewhere = mine.find((c) => c.status === 'running' && !isSeatRace(c.race, seat))
    const lost = mine.find((c) => c.status === 'lost')
    // A candidate row flagged is_incumbent in the seat's own race that is not
    // linked to any politician is this person under another spelling — the
    // reconcile stores "John Bergman" where the roster says "Jack Bergman".
    // Reading that as "Seat open" would be wrong, so it counts as running.
    const unlinkedIncumbentRunning =
      seatRace?.candidates?.some((c) => c.status === 'running' && c.is_incumbent && (c.politician_id === null || c.politician_id === seat.id)) ?? false

    if (runningHere || (unlinkedIncumbentRunning && seatRace)) {
      const race = (runningHere?.race ?? seatRace)!
      out.set(seat.id, pick('running', race.ballot_confirmed_at ? 'Running again' : 'Filed to run again', race))
    } else if (runningElsewhere) {
      const office = OFFICE[runningElsewhere.race.chamber] ?? runningElsewhere.race.chamber
      const word = runningElsewhere.race.ballot_confirmed_at ? 'Running for' : 'Filed for'
      out.set(seat.id, pick('other_race', `${word} ${office}`, runningElsewhere.race))
    } else if (lost) {
      out.set(seat.id, pick('lost', 'Lost primary', lost.race))
    } else if (seatRace) {
      out.set(seat.id, pick('seat_open', 'Seat open', seatRace))
    } else {
      out.set(seat.id, notUp())
    }
  }
  return out
}

function pick(kind: CandidacyKind, label: string, race: RaceRow): Candidacy {
  return { kind, label, raceSlug: race.slug, raceName: race.name, raceChamber: race.chamber, confirmed: !!race.ballot_confirmed_at }
}

function notUp(): Candidacy {
  return { kind: 'not_up', label: 'Not up this year', raceSlug: null, raceName: null, raceChamber: null, confirmed: false }
}
