import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { PollStatusToggle } from '@/components/admin/poll-status-toggle'

export default async function AdminPollsPage() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('polls')
    .select('*, poll_options(id, label, sort_order), poll_votes(id)')
    .order('created_at', { ascending: false })

  const polls = data ?? []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Polls</h1>
          <p className="text-sm text-[var(--codex-sub)]">{polls.length} polls</p>
        </div>
        <Link
          href="/admin/polls/new"
          className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline hover:opacity-90"
        >
          + Create Poll
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex gap-6 border-b border-[var(--codex-border)]">
        {['all', 'active', 'closed', 'draft'].map((status) => {
          const count = status === 'all'
            ? polls.length
            : polls.filter((p: any) => p.status === status).length
          return (
            <span
              key={status}
              className="border-b-2 border-transparent pb-2 text-[12px] font-medium uppercase tracking-wider text-[var(--codex-sub)]"
            >
              {status} ({count})
            </span>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-md border border-[var(--codex-border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--codex-border)] bg-[var(--codex-card)]">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Title
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Type
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Options
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
            {polls.map((poll: any) => (
              <tr
                key={poll.id}
                className="border-b border-[var(--codex-border)] transition-colors hover:bg-[var(--codex-hover)]"
              >
                <td className="px-4 py-3 text-sm font-medium">{poll.title}</td>
                <td className="px-4 py-3">
                  <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                    {poll.poll_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PollStatusToggle pollId={poll.id} currentStatus={poll.status} />
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {(poll.poll_options as any[])?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {(poll.poll_votes as any[])?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/polls/${poll.id}`}
                    className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {polls.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--codex-faint)]">
                  No polls yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
