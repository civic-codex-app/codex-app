import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

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

  const stats = [
    { label: 'Politicians', value: politicianCount ?? 0, href: '/admin/politicians' },
    { label: 'Stances', value: stanceCount ?? 0, href: '/admin/issues' },
    { label: 'With Images', value: imageCount ?? 0, href: '/admin/politicians' },
    { label: 'Candidates', value: candidateCount ?? 0, href: '/admin/elections' },
    { label: 'Issues', value: issueCount ?? 0, href: '/admin/issues' },
    { label: 'Elections', value: electionCount ?? 0, href: '/admin/elections' },
    { label: 'Bills', value: billCount ?? 0, href: '/admin/bills' },
    { label: 'Voting Records', value: voteCount ?? 0, href: '/admin/voting-records' },
    { label: 'Campaign Finance', value: financeCount ?? 0, href: '/admin/finance' },
    { label: 'Users', value: userCount ?? 0, href: '/admin/users' },
  ]

  // New registrations in last 24h
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: newUserCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday)

  // Unread inbox submissions
  const { count: inboxNewCount } = await supabase
    .from('public_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const quickActions = [
    { label: 'Add Politician', href: '/admin/politicians/new' },
    { label: 'Add Election', href: '/admin/elections/new' },
    { label: 'Add Issue', href: '/admin/issues/new' },
    { label: 'Add Bill', href: '/admin/bills/new' },
    { label: 'Daily Topics', href: '/admin/daily-topics' },
    { label: 'View Inbox', href: '/admin/inbox' },
  ]

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Admin Overview</h1>
      <p className="mb-6 text-sm text-[var(--poli-sub)]">Manage your political directory data</p>

      {/* Notifications */}
      {((newUserCount ?? 0) > 0 || (inboxNewCount ?? 0) > 0) && (
        <div className="mb-8 flex flex-wrap gap-3">
          {(newUserCount ?? 0) > 0 && (
            <Link
              href="/admin/users"
              className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm no-underline transition-all hover:border-blue-500/40"
            >
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-bold text-white">{newUserCount}</span>
              <span className="text-[var(--poli-text)]">new user{(newUserCount ?? 0) !== 1 ? 's' : ''} registered today</span>
            </Link>
          )}
          {(inboxNewCount ?? 0) > 0 && (
            <Link
              href="/admin/inbox"
              className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm no-underline transition-all hover:border-amber-500/40"
            >
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">{inboxNewCount}</span>
              <span className="text-[var(--poli-text)]">unread submission{(inboxNewCount ?? 0) !== 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-md border border-[var(--poli-border)] bg-[var(--poli-card)] p-5 no-underline transition-colors hover:border-[var(--poli-text)]/20"
          >
            <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[var(--poli-sub)]">
              {s.label}
            </div>
            <div className="text-3xl font-bold text-[var(--poli-text)]">{s.value}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold text-[var(--poli-sub)]">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-md border border-[var(--poli-border)] bg-[var(--poli-card)] px-4 py-2 text-sm text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
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
            <h2 className="text-sm font-semibold text-[var(--poli-sub)]">
              Recently Added Officials
            </h2>
            <Link
              href="/admin/politicians"
              className="text-[11px] text-[var(--poli-faint)] hover:text-[var(--poli-text)]"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-md border border-[var(--poli-border)]">
            {(recentPoliticians ?? []).map((pol: any) => (
              <Link
                key={pol.id}
                href={`/admin/politicians/${pol.id}`}
                className="flex items-center justify-between border-b border-[var(--poli-border)] px-4 py-3 text-sm no-underline transition-colors last:border-b-0 hover:bg-[var(--poli-hover)]"
              >
                <span className="font-medium text-[var(--poli-text)]">{pol.name}</span>
                <span className="text-[11px] text-[var(--poli-faint)]">
                  {pol.state} &middot; {pol.chamber}
                </span>
              </Link>
            ))}
            {(recentPoliticians ?? []).length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[var(--poli-faint)]">
                No politicians yet
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
