import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { PoliticianCard } from '@/components/directory/politician-card'
import { ElectionCountdown } from '@/components/elections/election-countdown'
import { RecentActivityFeed, type ActivityItem } from '@/components/dashboard/recent-activity-feed'
import { IssuePriorities } from '@/components/dashboard/issue-priorities'
import type { Politician } from '@/lib/types/politician'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor } from '@/lib/constants/parties'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { STATE_NAMES } from '@/lib/constants/us-states'

const QUICK_LINKS = [
  {
    href: '/match',
    title: 'Alignment Quiz',
    description: 'Find politicians who align with your views',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/report-cards',
    title: 'Report Cards',
    description: 'See how politicians score on key issues',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: '/issues/map',
    title: 'Issue Map',
    description: 'Explore stances on issues across the country',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    href: '/ballot',
    title: 'My Ballot',
    description: 'Preview what\'s on your ballot',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: '/insights/money-map',
    title: 'Money Map',
    description: 'Follow the money in campaign finance',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile for state + zip
  const { data: profile } = await supabase
    .from('profiles')
    .select('state, zip_code')
    .eq('id', user!.id)
    .single()

  const userState = profile?.state as string | null
  const userZip = profile?.zip_code as string | null

  // Get representatives: senators + governor (statewide)
  // If user has a zip, also try to find their House rep via the API
  let representatives: Politician[] = []
  if (userState) {
    const { data } = await supabase
      .from('politicians')
      .select('*')
      .eq('state', userState)
      .in('chamber', ['senate', 'governor'])
      .order('chamber')
      .order('name')
      .limit(10)
    representatives = (data ?? []) as Politician[]
  }

  // Try to find House rep via zip lookup
  if (userZip && /^\d{5}$/.test(userZip)) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const repRes = await fetch(`${baseUrl}/api/representatives?zip=${userZip}`, { next: { revalidate: 86400 } })
      if (repRes.ok) {
        const repData = await repRes.json()
        const apiReps = (repData.representatives ?? []) as Politician[]
        // Add any House reps not already in the list
        const existingIds = new Set(representatives.map(r => r.id))
        for (const rep of apiReps) {
          if (!existingIds.has(rep.id) && rep.chamber === 'house') {
            representatives.push(rep)
          }
        }
      }
    } catch {
      // Zip lookup failed, just show statewide reps
    }
  }

  // Get followed politicians
  const { data: follows } = await supabase
    .from('follows')
    .select('politician_id')
    .eq('user_id', user!.id)

  const followedIds = (follows ?? []).map((f) => f.politician_id)

  let followedPoliticians: Politician[] = []
  if (followedIds.length > 0) {
    const { data } = await supabase
      .from('politicians')
      .select('*')
      .in('id', followedIds)
      .order('name')
    followedPoliticians = (data ?? []) as Politician[]
  }

  // Build recent activity feed: votes + stance updates from followed politicians (last 30 days)
  let activityFeed: ActivityItem[] = []
  if (followedIds.length > 0) {
    const polMap = new Map(followedPoliticians.map(p => [p.id, p]))
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoff = thirtyDaysAgo.toISOString().split('T')[0]

    // Fetch recent votes
    const { data: recentVotes } = await supabase
      .from('voting_records')
      .select('bill_name, bill_number, vote, vote_date, politician_id')
      .in('politician_id', followedIds.slice(0, 20))
      .gte('vote_date', cutoff)
      .order('vote_date', { ascending: false })
      .limit(20)

    if (recentVotes) {
      for (const v of recentVotes) {
        if (!v.bill_name || /^[0-9a-f]{8}-/.test(v.bill_name)) continue
        const pol = polMap.get(v.politician_id)
        if (!pol) continue
        activityFeed.push({
          type: 'vote',
          politician_id: pol.id,
          politician_name: pol.name,
          politician_slug: pol.slug,
          politician_party: pol.party,
          politician_image_url: pol.image_url,
          bill_name: v.bill_name,
          bill_number: v.bill_number ?? '',
          vote: v.vote,
          date: v.vote_date,
        })
      }
    }

    // Fetch recent stance positions (use service role to avoid RLS issues)
    const serviceForStances = createServiceRoleClient()
    const { data: recentStances } = await serviceForStances
      .from('politician_issues')
      .select('politician_id, stance, updated_at, issue_id, issues(name, slug)')
      .in('politician_id', followedIds.slice(0, 20))
      .gte('updated_at', thirtyDaysAgo.toISOString())
      .order('updated_at', { ascending: false })
      .limit(20)

    if (recentStances) {
      for (const s of recentStances as any[]) {
        const pol = polMap.get(s.politician_id)
        if (!pol) continue
        const issue = s.issues as { name: string; slug: string } | null
        if (!issue) continue
        activityFeed.push({
          type: 'stance',
          politician_id: pol.id,
          politician_name: pol.name,
          politician_slug: pol.slug,
          politician_party: pol.party,
          politician_image_url: pol.image_url,
          issue_name: issue.name,
          issue_slug: issue.slug,
          stance: s.stance,
          date: s.updated_at.split('T')[0],
        })
      }
    }

    // Sort merged feed by date descending, take top 15
    activityFeed.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
    activityFeed = activityFeed.slice(0, 15)
  }

  // Get followed bills
  const { data: billFollows } = await supabase
    .from('bill_follows')
    .select('bill_id')
    .eq('user_id', user!.id)

  const followedBillIds = (billFollows ?? []).map((f: any) => f.bill_id)

  let followedBills: Array<{ id: string; title: string; number: string; status: string; last_action_date: string | null }> = []
  if (followedBillIds.length > 0) {
    const serviceClient = createServiceRoleClient()
    const { data } = await serviceClient
      .from('bills')
      .select('id, title, number, status, last_action_date')
      .in('id', followedBillIds)
      .order('last_action_date', { ascending: false })
    followedBills = (data ?? []) as any
  }

  // Get upcoming election
  const serviceClient = createServiceRoleClient()
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: upcomingElection } = await serviceClient
    .from('elections')
    .select('name, slug, election_date')
    .eq('is_active', true)
    .gte('election_date', todayStr)
    .order('election_date')
    .limit(1)
    .maybeSingle()

  const stateName = userState ? STATE_NAMES[userState] ?? userState : null

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
      <p className="mb-10 text-sm text-[var(--codex-sub)]">
        Your personalized political directory
      </p>

      {/* Your Representatives */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--codex-sub)]">
            Your Representatives{stateName ? ` \u00b7 ${stateName}` : ''}
          </h2>
          {userState && (
            <Link
              href={`/directory?state=${userState}`}
              className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
            >
              View all &rarr;
            </Link>
          )}
        </div>

        {userState ? (
          representatives.length > 0 ? (
            <div className="divide-y divide-[var(--codex-border)] rounded-md border border-[var(--codex-border)]">
              {representatives.map((pol) => (
                <Link
                  key={pol.id}
                  href={`/politicians/${pol.slug}`}
                  className="flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-[var(--codex-hover)]"
                >
                  <div
                    className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-[var(--codex-border)]"
                  >
                    <AvatarImage
                      src={pol.image_url}
                      alt={pol.name}
                      size={36}
                      fallbackColor={partyColor(pol.party)}
                      party={pol.party}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-[var(--codex-text)]">
                        {pol.name}
                      </span>
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: partyColor(pol.party) }}
                      />
                    </div>
                    <div className="text-xs text-[var(--codex-sub)]">
                      {pol.title ?? CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber}
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] text-[var(--codex-badge-text)]">
                    {CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-[var(--codex-border)] py-10 text-center">
              <p className="text-sm text-[var(--codex-sub)]">
                No representatives found for {stateName}
              </p>
            </div>
          )
        ) : (
          <div className="rounded-md border border-[var(--codex-border)] py-10 text-center">
            <p className="mb-4 text-sm text-[var(--codex-sub)]">
              Set your state in account settings to see your representatives
            </p>
            <Link
              href="/account"
              className="rounded-md bg-[var(--codex-badge-bg)] px-4 py-2 text-sm text-[var(--codex-text)] no-underline hover:bg-[var(--codex-hover)]"
            >
              Account settings
            </Link>
          </div>
        )}
      </section>

      {/* Issue Priorities */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--codex-sub)]">
            Your Issue Priorities
          </h2>
          <Link
            href="/ballot"
            className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
          >
            Ballot preview &rarr;
          </Link>
        </div>
        <IssuePriorities zip={userZip} />
      </section>

      {/* Quick Links */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-lg border border-[var(--codex-border)] p-4 no-underline transition-colors hover:border-[var(--codex-sub)] hover:bg-[var(--codex-hover)]"
            >
              <div className="mb-2 text-[var(--codex-sub)] transition-colors group-hover:text-[var(--codex-text)]">
                {link.icon}
              </div>
              <div className="text-sm font-medium text-[var(--codex-text)]">
                {link.title}
              </div>
              <div className="mt-0.5 text-xs leading-snug text-[var(--codex-sub)]">
                {link.description}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity Feed */}
      {followedIds.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
            Recent Activity
          </h2>
          <div className="rounded-md border border-[var(--codex-border)] px-4 py-3">
            <RecentActivityFeed items={activityFeed} />
          </div>
        </section>
      )}

      {/* Followed Bills */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--codex-sub)]">
            Saved Bills ({followedBills.length})
          </h2>
          <Link
            href="/bills"
            className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
          >
            Browse bills &rarr;
          </Link>
        </div>

        {followedBills.length > 0 ? (
          <div className="divide-y divide-[var(--codex-border)] rounded-md border border-[var(--codex-border)]">
            {followedBills.map((bill) => {
              const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
                signed_into_law: { label: 'Signed', color: '#22C55E', bg: '#22C55E18' },
                passed_house: { label: 'Passed House', color: '#3B82F6', bg: '#3B82F618' },
                passed_senate: { label: 'Passed Senate', color: '#3B82F6', bg: '#3B82F618' },
                in_committee: { label: 'In Committee', color: '#EAB308', bg: '#EAB30818' },
                failed: { label: 'Failed', color: '#EF4444', bg: '#EF444418' },
                vetoed: { label: 'Vetoed', color: '#F97316', bg: '#F9731618' },
              }
              const sc = statusConfig[bill.status] ?? { label: bill.status, color: '#6B7280', bg: '#6B728018' }

              return (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-[var(--codex-hover)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-sm bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-[var(--codex-badge-text)]">
                        {bill.number}
                      </span>
                      <span
                        className="rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em]"
                        style={{ color: sc.color, background: sc.bg }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-sm text-[var(--codex-text)]">
                      {bill.title}
                    </div>
                  </div>
                  {bill.last_action_date && (
                    <span className="flex-shrink-0 text-[11px] text-[var(--codex-faint)]">
                      {new Date(bill.last_action_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-md border border-[var(--codex-border)] py-10 text-center">
            <p className="mb-2 text-sm text-[var(--codex-sub)]">
              No saved bills yet
            </p>
            <p className="text-xs text-[var(--codex-faint)]">
              Bookmark bills to track their progress here
            </p>
          </div>
        )}
      </section>

      {/* Upcoming Election */}
      {upcomingElection && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
            Upcoming Election
          </h2>
          <Link
            href={`/elections`}
            className="block rounded-md border border-[var(--codex-border)] p-5 no-underline transition-colors hover:border-[var(--codex-sub)] hover:bg-[var(--codex-hover)]"
          >
            <div className="mb-1 text-lg font-semibold text-[var(--codex-text)]">
              {upcomingElection.name}
            </div>
            <div className="mb-3 text-xs text-[var(--codex-faint)]">
              {new Date(upcomingElection.election_date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <ElectionCountdown electionDate={upcomingElection.election_date} />
          </Link>
        </section>
      )}

      {/* Following */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--codex-sub)]">
            Following ({followedPoliticians.length})
          </h2>
          <Link
            href="/"
            className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
          >
            Browse directory &rarr;
          </Link>
        </div>

        {followedPoliticians.length > 0 ? (
          <div>
            {followedPoliticians.map((pol) => (
              <PoliticianCard key={pol.id} politician={pol} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-[var(--codex-border)] py-16 text-center">
            <div className="mb-2 text-xl font-semibold text-[var(--codex-faint)]">
              Not following anyone yet
            </div>
            <p className="mb-6 text-sm text-[var(--codex-sub)]">
              Browse the directory and follow politicians to see them here
            </p>
            <Link
              href="/"
              className="rounded-md bg-[var(--codex-badge-bg)] px-4 py-2 text-sm text-[var(--codex-text)] no-underline hover:bg-[var(--codex-hover)]"
            >
              Browse directory
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
