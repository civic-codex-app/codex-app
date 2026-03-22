import { createClient } from '@/lib/supabase/server'
import { PoliticianCard } from '@/components/directory/politician-card'
import type { Politician } from '@/lib/types/politician'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor } from '@/lib/constants/parties'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { STATE_NAMES } from '@/lib/constants/us-states'

const QUICK_LINKS = [
  {
    href: '/match',
    title: 'Voter Match',
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

  // Get user profile for state
  const { data: profile } = await supabase
    .from('profiles')
    .select('state')
    .eq('id', user!.id)
    .single()

  const userState = profile?.state as string | null

  // Get state representatives if user has a state set
  let representatives: Politician[] = []
  if (userState) {
    const { data } = await supabase
      .from('politicians')
      .select('*')
      .eq('state', userState)
      .in('chamber', ['senate', 'house', 'governor'])
      .order('chamber')
      .order('name')
    representatives = (data ?? []) as Politician[]
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

  const stateName = userState ? STATE_NAMES[userState] ?? userState : null

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Dashboard</h1>
      <p className="mb-10 text-sm text-[var(--codex-sub)]">
        Your personalized political directory
      </p>

      {/* Your Representatives */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
            Your Representatives{stateName ? ` \u00b7 ${stateName}` : ''}
          </h2>
          {userState && (
            <Link
              href={`/politicians?state=${userState}`}
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

      {/* Quick Links */}
      <section className="mb-10">
        <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
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

      {/* Following */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
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
            <div className="mb-2 font-serif text-xl text-[var(--codex-faint)]">
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
