import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { PollForm } from '@/components/admin/poll-form'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPollPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: poll } = await supabase
    .from('polls')
    .select('*, poll_options(id, label, sort_order)')
    .eq('id', id)
    .single()

  if (!poll) notFound()

  // Get vote counts per option
  const { data: voteData } = await supabase
    .from('poll_votes')
    .select('option_id')
    .eq('poll_id', id)

  const voteCounts: Record<string, number> = {}
  for (const vote of voteData ?? []) {
    voteCounts[vote.option_id] = (voteCounts[vote.option_id] ?? 0) + 1
  }

  const totalVotes = voteData?.length ?? 0

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Edit Poll</h1>

      {/* Vote Summary */}
      {totalVotes > 0 && (
        <div className="mb-8 rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
          <div className="mb-3 text-sm font-semibold text-[var(--codex-sub)]">
            Vote Results ({totalVotes} total votes)
          </div>
          <div className="space-y-3">
            {((poll.poll_options as any[]) ?? [])
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((opt: any) => {
                const count = voteCounts[opt.id] ?? 0
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
                return (
                  <div key={opt.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{opt.label}</span>
                      <span className="text-[var(--codex-sub)]">{count} votes ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--codex-border)]">
                      <div
                        className="h-full rounded-full bg-[var(--codex-text)]"
                        style={{ width: `${pct}%`, opacity: 0.6 }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <PollForm poll={poll as any} />
    </div>
  )
}
