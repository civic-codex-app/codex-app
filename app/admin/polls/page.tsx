import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export default async function AdminPollsPage() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('polls')
    .select('*, poll_options(id), poll_votes(id)')
    .order('created_at', { ascending: false })

  const polls = data ?? []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-serif text-3xl">Polls</h1>
          <p className="text-sm text-[var(--codex-sub)]">{polls.length} polls</p>
        </div>
        <Link
          href="/admin/polls/new"
          className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline hover:opacity-90"
        >
          + Create Poll
        </Link>
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
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
                      poll.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : poll.status === 'closed'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {poll.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {(poll.poll_options as any[])?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {(poll.poll_votes as any[])?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-right">
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
