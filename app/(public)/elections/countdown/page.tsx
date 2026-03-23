import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ElectionCountdown } from '@/components/elections/election-countdown'
import { StateDatePicker } from '@/components/elections/state-date-picker'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Election Countdown -- Poli',
  description: 'Countdown to the next election with key dates for your state.',
}

export default async function ElectionCountdownPage() {
  const supabase = createServiceRoleClient()

  // Fetch the next active election
  const { data: elections } = await supabase
    .from('elections')
    .select('id, name, slug, election_date, is_active')
    .eq('is_active', true)
    .order('election_date', { ascending: true })
    .limit(1)

  const election = elections?.[0] ?? null
  const electionDate = election?.election_date ?? '2026-11-03'
  const electionName = election?.name ?? '2026 Midterm Elections'

  // Fetch ALL key dates for this election (manageable amount)
  let allKeyDates: {
    date_type: string
    event_date: string
    description: string | null
    source_url: string | null
    state: string | null
  }[] = []

  if (election) {
    const PAGE = 1000
    let from = 0
    while (true) {
      const { data } = await supabase
        .from('election_key_dates')
        .select('date_type, event_date, description, source_url, state')
        .eq('election_id', election.id)
        .order('event_date', { ascending: true })
        .range(from, from + PAGE - 1)
      if (!data || data.length === 0) break
      allKeyDates = allKeyDates.concat(data)
      if (data.length < PAGE) break
      from += PAGE
    }
  }

  // Try to get the user's state from their profile
  let userState: string | null = null
  try {
    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('state')
        .eq('id', user.id)
        .single()
      userState = profile?.state ?? null
    }
  } catch {
    // Not authenticated or profile fetch failed — that's fine
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[720px] px-6 pt-8 pb-16 md:px-10">
        {/* Back link */}
        <Link
          href="/elections"
          className="mb-6 inline-flex items-center gap-1 text-[13px] text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          All Elections
        </Link>

        {/* Title */}
        <h1 className="mb-2 font-serif text-3xl font-bold text-[var(--codex-text)]">
          Election Countdown
        </h1>
        <p className="mb-8 text-sm text-[var(--codex-sub)]">
          {electionName} — track deadlines and key dates for your state.
        </p>

        {/* Countdown timer card */}
        <div className="mb-10 rounded-md border border-[var(--codex-border)] p-6 text-center">
          <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-faint)]">
            Time remaining
          </div>
          <div className="flex justify-center">
            <ElectionCountdown electionDate={electionDate} />
          </div>
          <div className="mt-3 text-[13px] text-[var(--codex-sub)]">
            {new Date(electionDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* State date picker with timeline */}
        <div className="mb-10">
          <h2 className="mb-4 font-serif text-xl font-bold text-[var(--codex-text)]">
            Key Dates by State
          </h2>
          <StateDatePicker
            allKeyDates={allKeyDates}
            electionDate={electionDate}
            initialState={userState}
          />
        </div>

        {/* Link to full elections */}
        <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-hover)] p-4 text-center">
          <p className="mb-2 text-sm text-[var(--codex-sub)]">
            Want to see all the races on the ballot?
          </p>
          <Link
            href="/elections"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-blue-400 hover:underline"
          >
            Browse all elections
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        <Footer />
      </div>
    </>
  )
}
