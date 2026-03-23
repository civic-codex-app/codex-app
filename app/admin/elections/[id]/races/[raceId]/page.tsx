import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { RaceForm } from '@/components/admin/race-form'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string; raceId: string }>
}

export default async function EditRacePage({ params }: PageProps) {
  const { id, raceId } = await params
  const supabase = createServiceRoleClient()

  const { data: race } = await supabase
    .from('races')
    .select('*')
    .eq('id', raceId)
    .single()

  if (!race) notFound()

  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, name')
    .order('name')

  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .eq('race_id', raceId)
    .order('name')

  const candidateList = candidates ?? []

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Edit Race</h1>
        <RaceForm election_id={id} race={race as any} politicians={politicians ?? []} />
      </div>

      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Candidates</h2>
          <Link
            href={`/admin/elections/${id}/races/${raceId}/candidates/new`}
            className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline hover:opacity-90"
          >
            + Add Candidate
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
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                  Incumbent
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {candidateList.map((candidate: any) => (
                <tr
                  key={candidate.id}
                  className="border-b border-[var(--codex-border)] transition-colors hover:bg-[var(--codex-hover)]"
                >
                  <td className="px-4 py-3 text-sm font-medium">{candidate.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                      {candidate.party}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                    {candidate.is_incumbent ? 'Yes' : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/elections/${id}/races/${raceId}/candidates/${candidate.id}`}
                      className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {candidateList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--codex-faint)]">
                    No candidates yet
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
