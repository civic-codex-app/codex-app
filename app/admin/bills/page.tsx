import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export default async function AdminBillsPage() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('bills')
    .select('*, voting_records(id)')
    .order('introduced_date', { ascending: false })

  const bills = data ?? []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Bills</h1>
          <p className="text-sm text-[var(--codex-sub)]">{bills.length} bills</p>
        </div>
        <Link
          href="/admin/bills/new"
          className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline hover:opacity-90"
        >
          + Add Bill
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-[var(--codex-border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--codex-border)] bg-[var(--codex-card)]">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Number
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Title
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Session
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Votes
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill: any) => (
              <tr
                key={bill.id}
                className="border-b border-[var(--codex-border)] transition-colors hover:bg-[var(--codex-hover)]"
              >
                <td className="px-4 py-3 text-sm font-medium">{bill.number}</td>
                <td className="max-w-xs truncate px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {bill.title}
                </td>
                <td className="px-4 py-3">
                  {bill.status && (
                    <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                      {bill.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {bill.congress_session ?? ''}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {(bill.voting_records as any[])?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/bills/${bill.id}`}
                    className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--codex-faint)]">
                  No bills yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
