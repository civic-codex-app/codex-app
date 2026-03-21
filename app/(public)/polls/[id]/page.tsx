import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PollVoteForm } from '@/components/polls/poll-vote-form'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceRoleClient()
  const { data } = await supabase.from('polls').select('title').eq('id', id).single()
  if (!data) return { title: 'Not Found — Codex' }
  return { title: `${data.title} — Codex Polls` }
}

export default async function PollPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: poll } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (id, label, politician_id, sort_order),
      poll_votes (id, option_id, user_id)
    `)
    .eq('id', id)
    .single()

  if (!poll) notFound()

  // Check if current user has voted (use auth client for user session)
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  const userVote = user
    ? (poll.poll_votes as any[])?.find((v: any) => v.user_id === user.id)
    : null

  const totalVotes = (poll.poll_votes as any[])?.length ?? 0

  // Calculate results per option
  const options = ((poll.poll_options as any[]) ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((opt: any) => {
      const votes = (poll.poll_votes as any[])?.filter((v: any) => v.option_id === opt.id).length ?? 0
      return { ...opt, votes, pct: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0 }
    })

  const TYPE_LABELS: Record<string, string> = {
    approval: 'Approval Poll',
    matchup: 'Matchup Poll',
    issue: 'Issue Poll',
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[800px] px-6 md:px-10">
        <Link
          href="/polls"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
        >
          ← Back to polls
        </Link>

        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
            {TYPE_LABELS[poll.poll_type] ?? poll.poll_type}
          </span>
          {poll.status === 'closed' && (
            <span className="rounded-sm bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-red-400">
              Closed
            </span>
          )}
          <span className="text-[11px] text-[var(--codex-faint)]">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
        </div>

        <h1 className="mb-3 font-serif text-[clamp(28px,4vw,42px)] font-normal leading-[1.1]">
          {poll.title}
        </h1>

        {poll.description && (
          <p className="mb-8 text-[15px] leading-[1.7] text-[var(--codex-sub)]">
            {poll.description}
          </p>
        )}

        <PollVoteForm
          pollId={poll.id}
          options={options}
          userVoteOptionId={userVote?.option_id ?? null}
          isActive={poll.status === 'active'}
          isLoggedIn={!!user}
          totalVotes={totalVotes}
        />

        {poll.ends_at && (
          <div className="mt-6 text-xs text-[var(--codex-faint)]">
            {poll.status === 'closed' ? 'Ended' : 'Ends'}{' '}
            {new Date(poll.ends_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
