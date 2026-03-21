import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export default async function AdminElectionsPage() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('elections')
    .select('*, races(id)')
    .order('election_date', { ascending: false })

  const elections = data ?? []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-serif text-3xl">Elections</h1>
          <p className="text-sm text-[var(--codex-sub)]">{elections.length} elections</p>
        </div>
        <Link
          href="/admin/elections/new"
          className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline hover:opacity-90"
        >
          + New Election
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-[var(--codex-border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--codex-border)] bg-[var(--codex-card)]">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Races
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {elections.map((election: any) => (
              <tr
                key={election.id}
                className="border-b border-[var(--codex-border)] transition-colors hover:bg-[var(--codex-hover)]"
              >
                <td className="px-4 py-3 text-sm font-medium">{election.name}</td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {election.election_date}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                    {election.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {(election.races as any[])?.length ?? 0} races
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/elections/${election.id}`}
                    className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {elections.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--codex-faint)]">
                  No elections yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
