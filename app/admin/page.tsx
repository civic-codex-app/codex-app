import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export default async function AdminOverviewPage() {
  const supabase = createServiceRoleClient()

  const [
    { count: politicianCount },
    { count: billCount },
    { count: voteCount },
    { count: financeCount },
    { count: userCount },
    { count: stanceCount },
    { count: candidateCount },
    { count: pollCount },
    { count: electionCount },
    { count: issueCount },
  ] = await Promise.all([
    supabase.from('politicians').select('*', { count: 'exact', head: true }),
    supabase.from('bills').select('*', { count: 'exact', head: true }),
    supabase.from('voting_records').select('*', { count: 'exact', head: true }),
    supabase.from('campaign_finance').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('politician_issues').select('*', { count: 'exact', head: true }),
    supabase.from('candidates').select('*', { count: 'exact', head: true }),
    supabase.from('polls').select('*', { count: 'exact', head: true }),
    supabase.from('elections').select('*', { count: 'exact', head: true }),
    supabase.from('issues').select('*', { count: 'exact', head: true }),
  ])

  // Count politicians with images
  const { count: imageCount } = await supabase
    .from('politicians')
    .select('*', { count: 'exact', head: true })
    .not('image_url', 'is', null)

  // Recent politicians
  const { data: recentPoliticians } = await supabase
    .from('politicians')
    .select('id, name, party, state, chamber, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  // Active polls
  const { data: activePolls } = await supabase
    .from('polls')
    .select('id, title, status, poll_votes(id)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Politicians', value: politicianCount ?? 0, href: '/admin/politicians' },
    { label: 'Stances', value: stanceCount ?? 0, href: '/admin/issues' },
    { label: 'With Images', value: imageCount ?? 0, href: '/admin/politicians' },
    { label: 'Candidates', value: candidateCount ?? 0, href: '/admin/elections' },
    { label: 'Issues', value: issueCount ?? 0, href: '/admin/issues' },
    { label: 'Elections', value: electionCount ?? 0, href: '/admin/elections' },
    { label: 'Polls', value: pollCount ?? 0, href: '/admin/polls' },
    { label: 'Bills', value: billCount ?? 0, href: '/admin/bills' },
    { label: 'Voting Records', value: voteCount ?? 0, href: '/admin/voting-records' },
    { label: 'Campaign Finance', value: financeCount ?? 0, href: '/admin/finance' },
    { label: 'Users', value: userCount ?? 0, href: '/admin/users' },
  ]

  const quickActions = [
    { label: 'Add Politician', href: '/admin/politicians/new' },
    { label: 'Create Poll', href: '/admin/polls/new' },
    { label: 'Add Election', href: '/admin/elections/new' },
    { label: 'Add Issue', href: '/admin/issues/new' },
    { label: 'Add Bill', href: '/admin/bills/new' },
  ]

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Admin Overview</h1>
      <p className="mb-10 text-sm text-[var(--codex-sub)]">Manage your political directory data</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5 no-underline transition-colors hover:border-[var(--codex-text)]/20"
          >
            <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[var(--codex-sub)]">
              {s.label}
            </div>
            <div className="text-3xl font-bold text-[var(--codex-text)]">{s.value}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] px-4 py-2 text-sm text-[var(--codex-text)] no-underline transition-colors hover:bg-[var(--codex-hover)]"
            >
              + {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {/* Recent Politicians */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--codex-sub)]">
              Recently Added Officials
            </h2>
            <Link
              href="/admin/politicians"
              className="text-[11px] text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-md border border-[var(--codex-border)]">
            {(recentPoliticians ?? []).map((pol: any) => (
              <Link
                key={pol.id}
                href={`/admin/politicians/${pol.id}`}
                className="flex items-center justify-between border-b border-[var(--codex-border)] px-4 py-3 text-sm no-underline transition-colors last:border-b-0 hover:bg-[var(--codex-hover)]"
              >
                <span className="font-medium text-[var(--codex-text)]">{pol.name}</span>
                <span className="text-[11px] text-[var(--codex-faint)]">
                  {pol.state} &middot; {pol.chamber}
                </span>
              </Link>
            ))}
            {(recentPoliticians ?? []).length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[var(--codex-faint)]">
                No politicians yet
              </div>
            )}
          </div>
        </div>

        {/* Active Polls */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--codex-sub)]">
              Active Polls
            </h2>
            <Link
              href="/admin/polls"
              className="text-[11px] text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-md border border-[var(--codex-border)]">
            {(activePolls ?? []).map((poll: any) => (
              <Link
                key={poll.id}
                href={`/admin/polls/${poll.id}`}
                className="flex items-center justify-between border-b border-[var(--codex-border)] px-4 py-3 text-sm no-underline transition-colors last:border-b-0 hover:bg-[var(--codex-hover)]"
              >
                <span className="font-medium text-[var(--codex-text)]">{poll.title}</span>
                <span className="text-[11px] text-[var(--codex-faint)]">
                  {(poll.poll_votes as any[])?.length ?? 0} votes
                </span>
              </Link>
            ))}
            {(activePolls ?? []).length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[var(--codex-faint)]">
                No active polls
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
