import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

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
          <h1 className="mb-1 text-3xl font-bold">Elections</h1>
          <p className="text-sm text-[var(--poli-sub)]">{elections.length} elections</p>
        </div>
        <Link
          href="/admin/elections/new"
          className="rounded-md bg-[var(--poli-text)] px-4 py-2 text-sm font-medium text-[var(--poli-bg)] no-underline hover:opacity-90"
        >
          + New Election
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-[var(--poli-border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--poli-border)] bg-[var(--poli-card)]">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Races
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {elections.map((election: any) => (
              <tr
                key={election.id}
                className="border-b border-[var(--poli-border)] transition-colors hover:bg-[var(--poli-hover)]"
              >
                <td className="px-4 py-3 text-sm font-medium">{election.name}</td>
                <td className="px-4 py-3 text-sm text-[var(--poli-sub)]">
                  {election.election_date}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-sm bg-[var(--poli-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--poli-badge-text)]">
                    {election.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--poli-sub)]">
                  {(election.races as any[])?.length ?? 0} races
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/elections/${election.id}`}
                    className="text-xs text-[var(--poli-sub)] hover:text-[var(--poli-text)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {elections.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--poli-faint)]">
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
