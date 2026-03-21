import { createServiceRoleClient } from '@/lib/supabase/service-role'

export default async function AdminOverviewPage() {
  const supabase = createServiceRoleClient()

  const [
    { count: politicianCount },
    { count: billCount },
    { count: voteCount },
    { count: financeCount },
    { count: userCount },
  ] = await Promise.all([
    supabase.from('politicians').select('*', { count: 'exact', head: true }),
    supabase.from('bills').select('*', { count: 'exact', head: true }),
    supabase.from('voting_records').select('*', { count: 'exact', head: true }),
    supabase.from('campaign_finance').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Politicians', value: politicianCount ?? 0 },
    { label: 'Bills', value: billCount ?? 0 },
    { label: 'Voting Records', value: voteCount ?? 0 },
    { label: 'Campaign Finance', value: financeCount ?? 0 },
    { label: 'Users', value: userCount ?? 0 },
  ]

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Admin Overview</h1>
      <p className="mb-10 text-sm text-[var(--codex-sub)]">Manage your political directory data</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5"
          >
            <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[var(--codex-sub)]">
              {s.label}
            </div>
            <div className="font-serif text-3xl">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
