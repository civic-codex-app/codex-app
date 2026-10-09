import { AppShell } from '@/components/app/surface'
import { BallotView } from '@/components/ballot/ballot-view'
import { getNextElection, countdown } from '@/lib/utils/next-election'

/**
 * Your ballot.
 *
 * Prerendered: the page reads no cookies and no searchParams. The visitor's
 * ZIP, and the races it votes in, resolve on the client (ballot-view.tsx),
 * which is also what makes the page public — it used to call getUser() and
 * redirect the signed-out to /login.
 */
export const revalidate = 1800

export const metadata = {
  title: 'Your Ballot | Poli',
  description:
    'The federal and governor races on your ballot, with the candidates confirmed against official filings.',
}

export default async function BallotPage() {
  const election = await getNextElection()
  const c = election ? countdown(election.date) : null

  return (
    <AppShell>
      <div className="mx-auto max-w-[560px] px-4 pt-5">
        {c ? (
          <BallotView days={c.days} when={c.long} />
        ) : (
          <>
            <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Your ballot</h1>
            <p className="mt-2 text-[14.5px] text-[var(--poli-sub)]">No upcoming election is on record yet.</p>
          </>
        )}
      </div>
    </AppShell>
  )
}
