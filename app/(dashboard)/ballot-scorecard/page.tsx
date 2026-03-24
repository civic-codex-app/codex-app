import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { STATE_NAMES } from '@/lib/constants/us-states'
import { fetchBallotRaces, raceGroup, type Race, type RaceGroup } from '@/lib/utils/fetch-ballot'
import { computeVoterMatch } from '@/lib/utils/voter-match'
import { ScorecardRaceCard, type CandidateScore } from '@/components/ballot/scorecard-race-card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Your Ballot Scorecard | Poli',
  description: 'See how each candidate on your ballot aligns with your views.',
}

export default async function BallotScorecardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/ballot-scorecard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('state, zip_code, city, quiz_answers')
    .eq('id', user.id)
    .single()

  const userState = profile?.state as string | null
  const userZip = profile?.zip_code as string | null
  const userCity = profile?.city as string | null
  const quizAnswers = (profile?.quiz_answers ?? {}) as Record<string, string>
  const hasQuizAnswers = Object.keys(quizAnswers).length > 0
  const stateName = userState ? STATE_NAMES[userState] ?? userState : null

  // CTA: No quiz answers
  if (!hasQuizAnswers) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <h1 className="mb-2 text-3xl font-bold">Your Ballot Scorecard</h1>
        <p className="mb-8 text-sm text-[var(--poli-sub)]">
          See how each candidate aligns with your views
        </p>

        <div className="rounded-md border border-[var(--poli-border)] py-16 text-center">
          <div className="mb-3">
            <svg
              className="mx-auto h-10 w-10 text-[var(--poli-faint)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <p className="mb-2 text-sm font-medium text-[var(--poli-text)]">
            Take the quiz first
          </p>
          <p className="mb-6 text-sm text-[var(--poli-sub)]">
            Answer questions on key issues so we can match you with candidates.
          </p>
          <Link
            href="/quiz"
            className="rounded-md bg-[var(--poli-badge-bg)] px-5 py-2.5 text-sm font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
          >
            Start the Quiz
          </Link>
        </div>
      </div>
    )
  }

  // CTA: No state set
  if (!userState) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <h1 className="mb-2 text-3xl font-bold">Your Ballot Scorecard</h1>
        <p className="mb-8 text-sm text-[var(--poli-sub)]">
          See how each candidate aligns with your views
        </p>

        <div className="rounded-md border border-[var(--poli-border)] py-16 text-center">
          <div className="mb-3">
            <svg
              className="mx-auto h-10 w-10 text-[var(--poli-faint)]"
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
          <p className="mb-2 text-sm font-medium text-[var(--poli-text)]">
            Location needed
          </p>
          <p className="mb-6 text-sm text-[var(--poli-sub)]">
            Set your state and zip code so we can find your ballot races.
          </p>
          <Link
            href="/account"
            className="rounded-md bg-[var(--poli-badge-bg)] px-5 py-2.5 text-sm font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
          >
            Update Profile
          </Link>
        </div>
      </div>
    )
  }

  // Look up congressional district from zip
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

  // Fetch ballot races
  const races = await fetchBallotRaces(userState, userDistrict, userCity)

  // Collect all candidate IDs and their politician_ids for stance lookup
  const allCandidates = races.flatMap((r) => r.candidates)
  const candidateIds = allCandidates.map((c) => c.id)
  const politicianCandidates = allCandidates.filter((c) => c.politician_id)
  const politicianIds = politicianCandidates.map((c) => c.politician_id!)

  const service = createServiceRoleClient()
  const PAGE = 500

  // Fetch candidate stances (candidate_issues joined with issues for slug)
  const candidateStanceMap = new Map<string, Record<string, string>>()
  const candidateVerifiedMap = new Map<string, Record<string, boolean>>()

  if (candidateIds.length > 0) {
    let allStances: any[] = []
    let from = 0
    let hasMore = true

    while (hasMore) {
      const { data } = await service
        .from('candidate_issues')
        .select('candidate_id, stance, is_verified, issue_id, issues(slug)')
        .in('candidate_id', candidateIds)
        .range(from, from + PAGE - 1)

      if (!data || data.length === 0) {
        hasMore = false
      } else {
        allStances = [...allStances, ...data]
        from += PAGE
        if (data.length < PAGE) hasMore = false
      }
    }

    for (const s of allStances) {
      const issue = s.issues as { slug: string } | null
      if (!issue?.slug) continue
      // Build stance record
      const stances = candidateStanceMap.get(s.candidate_id) ?? {}
      stances[issue.slug] = s.stance
      candidateStanceMap.set(s.candidate_id, stances)
      // Build verified record
      const verified = candidateVerifiedMap.get(s.candidate_id) ?? {}
      verified[issue.slug] = s.is_verified ?? false
      candidateVerifiedMap.set(s.candidate_id, verified)
    }
  }

  // Fetch politician stances for candidates that link to a politician
  const politicianStanceMap = new Map<string, Record<string, string>>()
  const politicianVerifiedMap = new Map<string, Record<string, boolean>>()

  if (politicianIds.length > 0) {
    let allStances: any[] = []
    let from = 0
    let hasMore = true

    while (hasMore) {
      const { data } = await service
        .from('politician_issues')
        .select('politician_id, stance, is_verified, issue_id, issues(slug)')
        .in('politician_id', politicianIds)
        .range(from, from + PAGE - 1)

      if (!data || data.length === 0) {
        hasMore = false
      } else {
        allStances = [...allStances, ...data]
        from += PAGE
        if (data.length < PAGE) hasMore = false
      }
    }

    for (const s of allStances) {
      const issue = s.issues as { slug: string } | null
      if (!issue?.slug) continue
      const stances = politicianStanceMap.get(s.politician_id) ?? {}
      stances[issue.slug] = s.stance
      politicianStanceMap.set(s.politician_id, stances)
      const verified = politicianVerifiedMap.get(s.politician_id) ?? {}
      verified[issue.slug] = s.is_verified ?? false
      politicianVerifiedMap.set(s.politician_id, verified)
    }
  }

  // Compute scores for each candidate
  const scoreMap = new Map<string, CandidateScore>()

  for (const candidate of allCandidates) {
    // Prefer candidate_issues; fall back to politician_issues if linked
    let stances = candidateStanceMap.get(candidate.id)
    let verified = candidateVerifiedMap.get(candidate.id)

    if ((!stances || Object.keys(stances).length === 0) && candidate.politician_id) {
      stances = politicianStanceMap.get(candidate.politician_id)
      verified = politicianVerifiedMap.get(candidate.politician_id)
    }

    if (!stances || Object.keys(stances).length === 0) {
      scoreMap.set(candidate.id, { score: 0, matched: 0, total: 0 })
      continue
    }

    const result = computeVoterMatch(quizAnswers, stances, verified)
    scoreMap.set(candidate.id, result)
  }

  // Group races by category
  const grouped: Record<RaceGroup, Race[]> = {
    Federal: [],
    State: [],
    Local: [],
  }

  for (const race of races) {
    // Only show races that have candidates
    if (race.candidates.length === 0) continue
    const group = raceGroup(race.chamber)
    grouped[group].push(race)
  }

  const groups: RaceGroup[] = ['Federal', 'State', 'Local']
  const quizCount = Object.keys(quizAnswers).length
  const totalRacesWithCandidates = groups.reduce((sum, g) => sum + grouped[g].length, 0)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <h1 className="mb-2 text-3xl font-bold">Your Ballot Scorecard</h1>
      <p className="mb-1 text-sm text-[var(--poli-sub)]">
        See how each candidate aligns with your views
      </p>
      <p className="mb-8 text-xs text-[var(--poli-faint)]">
        Based on your quiz ({quizCount} issue{quizCount !== 1 ? 's' : ''}) and {stateName}
        {userZip ? ` (${userZip})` : ''} ballot.{' '}
        <Link href="/quiz" className="underline hover:text-[var(--poli-text)]">Retake quiz</Link>
        {' '}&middot;{' '}
        <Link href="/account" className="underline hover:text-[var(--poli-text)]">Update location</Link>
      </p>

      {totalRacesWithCandidates === 0 ? (
        <div className="rounded-md border border-[var(--poli-border)] py-16 text-center">
          <p className="mb-2 text-sm font-medium text-[var(--poli-text)]">
            No upcoming races found
          </p>
          <p className="text-sm text-[var(--poli-sub)]">
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
                <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
                  {groupName} Races
                  <span className="ml-2 text-[var(--poli-faint)]">({groupRaces.length})</span>
                </h2>

                <div className="space-y-3">
                  {groupRaces.map((race) => (
                    <ScorecardRaceCard
                      key={race.id}
                      race={race}
                      candidateScores={scoreMap}
                    />
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
