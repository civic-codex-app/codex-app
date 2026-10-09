import Link from 'next/link'
import { Face } from '@/components/app/face'
import { Chip } from '@/components/app/surface'
import { FollowButton } from '@/components/directory/follow-button'
import { partyLabel } from '@/lib/constants/parties'
import type { Candidacy } from '@/lib/utils/candidacy'

const ROLE: Record<string, string> = {
  senate: 'U.S. Senator',
  house: 'U.S. Representative',
  governor: 'Governor',
  presidential: 'President',
}

/**
 * The top of a profile: one face, one name, one line, and what to do next.
 * The party is the ring, never a tinted chip. The Marker appears here only
 * when the person is actually on a ballot.
 */
export function ProfileHero({
  pol,
  candidacy,
  electionDate,
}: {
  pol: {
    id: string
    name: string
    slug: string
    party: string
    state: string
    chamber: string
    district?: string | null
    title: string
    image_url: string | null
    website_url: string | null
  }
  candidacy: Candidacy | null
  /** "Nov 3", when there is an election to name. */
  electionDate: string | null
}) {
  const role = ROLE[pol.chamber] ?? pol.title
  const where = pol.chamber === 'house' && pol.district ? `${pol.state}-${pol.district}` : pol.state
  const onBallot = candidacy && (candidacy.kind === 'running' || candidacy.kind === 'other_race')

  return (
    <header className="mb-4 flex flex-col items-center text-center">
      <Face src={pol.image_url} alt={pol.name} size={96} party={pol.party} />
      <h1 className="mt-3.5 font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">{pol.name}</h1>
      <p className="mt-1 text-[14.5px] text-[var(--poli-sub)]">
        {[role, where, partyLabel(pol.party)].filter(Boolean).join(' · ')}
      </p>
      {onBallot && electionDate && (
        <span className="mt-2.5">
          <Chip tone="marker">On your ballot {electionDate}</Chip>
        </span>
      )}
      <div className="mt-4 flex w-full gap-2">
        <FollowButton politicianId={pol.id} className="h-11 flex-1 justify-center rounded-xl text-[14px] font-semibold" />
        {pol.website_url ? (
          <a
            href={pol.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 flex-1 items-center justify-center rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] text-[14px] font-semibold text-[var(--poli-text)] no-underline"
          >
            Contact
          </a>
        ) : null}
        <Link
          href={`/compare?a=${pol.slug}`}
          aria-label="Compare with another politician"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] text-[var(--poli-text)] no-underline"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 4v16" /><path d="M17 4v16" /><path d="M3 8h8" /><path d="M13 16h8" />
          </svg>
        </Link>
      </div>
    </header>
  )
}
