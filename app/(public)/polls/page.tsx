import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PollCard } from '@/components/polls/poll-card'

export const revalidate = 60 // 1 minute
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Polls — Poli',
  description: 'Vote on political races, issues, and matchups.',
}

export default async function PollsPage() {
  const supabase = createServiceRoleClient()

  const { data: polls } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (id, label, politician_id, sort_order),
      poll_votes (id, option_id)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const activePollsList = polls ?? []

  // Also get closed polls
  const { data: closedPolls } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (id, label, politician_id, sort_order),
      poll_votes (id, option_id)
    `)
    .eq('status', 'closed')
    .order('ends_at', { ascending: false })
    .limit(10)

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <div className="mb-12 max-w-[600px]">
          <h1 className="mb-4 animate-fade-up text-[clamp(32px,4vw,52px)] font-bold leading-[1.1]">
            Community Polls
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            Voice your opinion on races, candidates, and the issues that matter most.
          </p>
        </div>

        {activePollsList.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Active Polls
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {activePollsList.map((poll: any) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          </section>
        )}

        {(closedPolls ?? []).length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Closed Polls
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(closedPolls ?? []).map((poll: any) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          </section>
        )}

        {activePollsList.length === 0 && (closedPolls ?? []).length === 0 && (
          <div className="py-20 text-center text-[var(--codex-faint)]">
            <div className="mb-2 text-2xl font-bold">No polls yet</div>
            <div className="text-sm">Check back soon for community polls</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
