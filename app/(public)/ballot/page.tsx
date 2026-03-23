import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STATE_NAMES } from '@/lib/constants/us-states'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { AvatarImage } from '@/components/ui/avatar-image'
import { fetchBallotRaces, raceGroup, type Race, type RaceGroup, type Candidate } from '@/lib/utils/fetch-ballot'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Your Ballot Preview | Poli',
  description: 'See the races and candidates on your ballot based on your location.',
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default async function BallotPreviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/ballot')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('state, zip_code, city')
    .eq('id', user.id)
    .single()

  const userState = profile?.state as string | null
  const userZip = profile?.zip_code as string | null
  const userCity = profile?.city as string | null
  const stateName = userState ? STATE_NAMES[userState] ?? userState : null

  // If no state set, show prompt
  if (!userState) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <h1 className="mb-2 font-serif text-3xl font-bold">Your Ballot Preview</h1>
        <p className="mb-8 text-sm text-[var(--codex-sub)]">
          See the races and candidates that will appear on your ballot.
        </p>

        <div className="rounded-md border border-[var(--codex-border)] py-16 text-center">
          <div className="mb-3">
            <svg
              className="mx-auto h-10 w-10 text-[var(--codex-faint)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <p className="mb-2 text-sm font-medium text-[var(--codex-text)]">
            Location needed
          </p>
          <p className="mb-6 text-sm text-[var(--codex-sub)]">
            Set your state and zip code to see your personalized ballot.
          </p>
          <Link
            href="/account"
            className="rounded-md bg-[var(--codex-badge-bg)] px-5 py-2.5 text-sm font-medium text-[var(--codex-text)] no-underline transition-colors hover:bg-[var(--codex-hover)]"
          >
            Update Profile
          </Link>
        </div>
      </div>
    )
  }

  // Look up user's congressional district from zip
  let userDistrict: string | null = null
  if (userZip) {
    try {
      const zipMap = (await import('@/lib/data/zip-to-district.json')).default as Record<string, { state: string; district: string }[]>
      const entries = zipMap[userZip]
      if (entries && entries.length > 0) {
        userDistrict = entries[0].district
      }
    } catch {
      // zip-to-district.json may not exist
    }
  }

  const races = await fetchBallotRaces(userState, userDistrict, userCity)

  // Group races by category
  const grouped: Record<RaceGroup, Race[]> = {
    Federal: [],
    State: [],
    Local: [],
  }

  for (const race of races) {
    const group = raceGroup(race.chamber)
    grouped[group].push(race)
  }

  const groups: RaceGroup[] = ['Federal', 'State', 'Local']

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <h1 className="mb-2 font-serif text-3xl font-bold">Your Ballot Preview</h1>
      <p className="mb-1 text-sm text-[var(--codex-sub)]">
        Races and candidates for {stateName}
        {userZip ? ` (${userZip})` : ''}
      </p>
      <p className="mb-8 text-xs text-[var(--codex-faint)]">
        Based on your profile location. <Link href="/account" className="underline hover:text-[var(--codex-text)]">Update</Link>
      </p>

      {races.length === 0 ? (
        <div className="rounded-md border border-[var(--codex-border)] py-16 text-center">
          <p className="mb-2 text-sm font-medium text-[var(--codex-text)]">
            No upcoming races found
          </p>
          <p className="text-sm text-[var(--codex-sub)]">
            There are no active elections with races in {stateName} right now.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((groupName) => {
            const groupRaces = grouped[groupName]
            if (groupRaces.length === 0) return null

            return (
              <section key={groupName}>
                <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
                  {groupName} Races
                  <span className="ml-2 text-[var(--codex-faint)]">({groupRaces.length})</span>
                </h2>

                <div className="space-y-3">
                  {groupRaces.map((race) => (
                    <BallotRaceCard key={race.id} race={race} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Race Card ────────────────────────────────────────────────────── */
function BallotRaceCard({ race }: { race: Race }) {
  const chamberLabel =
    CHAMBER_LABELS[race.chamber as ChamberKey] ?? race.chamber

  return (
    <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)]">
      {/* Header */}
      <div className="border-b border-[var(--codex-border)] px-5 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
            {chamberLabel}
          </span>
          {race.district && (
            <span className="text-[11px] text-[var(--codex-faint)]">
              District {race.district}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-[var(--codex-text)]">
          {race.name}
        </h3>
        {race.election_date && (
          <p className="mt-0.5 text-[11px] text-[var(--codex-faint)]">
            {race.election_name} &middot;{' '}
            {new Date(race.election_date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Candidates */}
      {race.candidates.length > 0 ? (
        <div className="divide-y divide-[var(--codex-border)]">
          {race.candidates.map((candidate) => (
            <CandidateRow key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : (
        <div className="px-5 py-6 text-center text-sm text-[var(--codex-faint)]">
          No candidates filed yet
        </div>
      )}
    </div>
  )
}

/* ── Candidate Row ────────────────────────────────────────────────── */
function CandidateRow({ candidate }: { candidate: Candidate }) {
  const href = candidate.politician_id
    ? `/politicians/${candidate.politician_id}`
    : `/candidates/${candidate.id}`

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3 no-underline transition-colors hover:bg-[var(--codex-hover)]"
    >
      {/* Avatar */}
      <div
        className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full"
        style={{ border: `2px solid ${partyColor(candidate.party)}33` }}
      >
        <AvatarImage
          src={candidate.image_url}
          alt={candidate.name}
          size={36}
          fallbackColor={partyColor(candidate.party)}
          party={candidate.party}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-[var(--codex-text)]">
            {candidate.name}
          </span>
          {candidate.is_incumbent && (
            <span className="rounded-sm bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-[var(--codex-badge-text)]">
              Incumbent
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--codex-sub)]">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: partyColor(candidate.party) }}
          />
          <span>{partyLabel(candidate.party)}</span>
          {candidate.stance_count > 0 && (
            <>
              <span className="text-[var(--codex-faint)]">&middot;</span>
              <span className="text-[var(--codex-faint)]">
                {candidate.stance_count} stance{candidate.stance_count !== 1 ? 's' : ''} on record
              </span>
            </>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg
        className="h-4 w-4 flex-shrink-0 text-[var(--codex-faint)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  )
}
