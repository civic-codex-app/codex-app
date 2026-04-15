import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PollVoteClient } from './poll-vote-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const TYPE_LABELS: Record<string, string> = {
  approval: 'Approval Poll',
  matchup: 'Matchup Poll',
  issue: 'Issue Poll',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceRoleClient()
  const { data } = await supabase.from('polls').select('title').eq('id', id).single()
  if (!data) return { title: 'Not Found | Poli' }
  const description = `Vote on: ${data.title}`
  const ogUrl = `/api/og?title=${encodeURIComponent(data.title)}&subtitle=${encodeURIComponent('Community Poll')}&type=default`
  return {
    title: `${data.title} | Poli Polls`,
    description,
    alternates: { canonical: `https://getpoli.app/polls/${id}` },
    openGraph: {
      title: data.title,
      description,
      url: `https://getpoli.app/polls/${id}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: data.title, images: [ogUrl] },
  }
}

export default async function PollDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: poll } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (id, label, sort_order),
      poll_votes (id, option_id)
    `)
    .eq('id', id)
    .single()

  if (!poll) notFound()

  // Check cookie-based voting
  const cookieStore = await cookies()
  const voteCookie = cookieStore.get(`voted-${poll.id}`)
  const hasVoted = !!voteCookie
  const votedOptionId = voteCookie?.value ?? null

  // Compute vote counts per option
  const votes = (poll.poll_votes ?? []) as { id: string; option_id: string }[]
  const totalVotes = votes.length

  const options = ((poll.poll_options ?? []) as { id: string; label: string; sort_order: number }[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((opt) => {
      const count = votes.filter((v) => v.option_id === opt.id).length
      return {
        id: opt.id,
        label: opt.label,
        votes: count,
        pct: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
      }
    })

  const isActive = poll.status === 'active'
  const endDate = poll.ends_at ? new Date(poll.ends_at) : null
  const isExpired = endDate ? endDate < new Date() : false
  const effectivelyActive = isActive && !isExpired

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[800px] px-6 md:px-10">
        <Link
          href="/polls"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--poli-sub)] no-underline transition-colors hover:text-[var(--poli-text)]"
        >
          &larr; Back to polls
        </Link>

        {/* Type & status badges */}
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-sm bg-[var(--poli-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--poli-badge-text)]">
            {TYPE_LABELS[poll.poll_type] ?? poll.poll_type}
          </span>
          {effectivelyActive ? (
            <span className="rounded-sm bg-green-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-green-400">
              Active
            </span>
          ) : (
            <span className="rounded-sm bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-red-400">
              Closed
            </span>
          )}
          <span className="text-[11px] text-[var(--poli-faint)]">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Poll question */}
        <h1 className="mb-3 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          {poll.title}
        </h1>

        {poll.description && (
          <p className="mb-8 text-[15px] leading-[1.7] text-[var(--poli-sub)]">
            {poll.description}
          </p>
        )}

        {/* Voting form / results */}
        <div className="rounded-md border border-[var(--poli-border)] bg-[var(--poli-card)] p-6">
          <PollVoteClient
            pollId={poll.id}
            options={options}
            hasVoted={hasVoted}
            votedOptionId={votedOptionId}
            isActive={effectivelyActive}
            totalVotes={totalVotes}
          />
        </div>

        {/* End date */}
        {endDate && (
          <div className="mt-6 text-xs text-[var(--poli-faint)]">
            {effectivelyActive ? 'Ends' : 'Ended'}{' '}
            {endDate.toLocaleDateString('en-US', {
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
