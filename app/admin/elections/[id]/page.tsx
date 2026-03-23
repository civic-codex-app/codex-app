import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { ElectionForm } from '@/components/admin/election-form'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditElectionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: election } = await supabase
    .from('elections')
    .select('*')
    .eq('id', id)
    .single()

  if (!election) notFound()

  const { data: races } = await supabase
    .from('races')
    .select('*, candidates(id)')
    .eq('election_id', id)
    .order('name')

  const raceList = races ?? []

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Edit Election</h1>
        <ElectionForm election={election as any} />
      </div>

      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Races</h2>
          <Link
            href={`/admin/elections/${id}/races/new`}
            className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline hover:opacity-90"
          >
            + Add Race
          </Link>
        </div>

        <div className="overflow-hidden rounded-md border border-[var(--codex-border)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--codex-border)] bg-[var(--codex-card)]">
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                  Race
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                  State
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                  Chamber
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                  Candidates
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {raceList.map((race: any) => (
                <tr
                  key={race.id}
                  className="border-b border-[var(--codex-border)] transition-colors hover:bg-[var(--codex-hover)]"
                >
                  <td className="px-4 py-3 text-sm font-medium">{race.name}</td>
                  <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">{race.state}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                      {race.chamber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                    {(race.candidates as any[])?.length ?? 0} candidates
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/elections/${id}/races/${race.id}`}
                      className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {raceList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--codex-faint)]">
                    No races yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
