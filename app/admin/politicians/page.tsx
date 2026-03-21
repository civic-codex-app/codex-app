import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import type { Politician } from '@/lib/types/politician'

export default async function AdminPoliticiansPage() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase.from('politicians').select('*').order('name')
  const politicians = (data ?? []) as Politician[]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-serif text-3xl">Politicians</h1>
          <p className="text-sm text-[var(--codex-sub)]">{politicians.length} entries</p>
        </div>
        <Link
          href="/admin/politicians/new"
          className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline hover:opacity-90"
        >
          + Add Politician
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
                Party
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                State
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Chamber
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {politicians.map((pol) => (
              <tr
                key={pol.id}
                className="border-b border-[var(--codex-border)] transition-colors hover:bg-[var(--codex-hover)]"
              >
                <td className="px-4 py-3 text-sm font-medium">{pol.name}</td>
                <td className="px-4 py-3 text-sm" style={{ color: partyColor(pol.party) }}>
                  {partyLabel(pol.party)}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">{pol.state}</td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {CHAMBER_LABELS[pol.chamber as ChamberKey]}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/politicians/${pol.id}`}
                    className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
