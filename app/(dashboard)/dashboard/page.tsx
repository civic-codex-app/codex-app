import { createClient } from '@/lib/supabase/server'
import { PoliticianCard } from '@/components/directory/politician-card'
import type { Politician } from '@/lib/types/politician'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get followed politicians
  const { data: follows } = await supabase
    .from('follows')
    .select('politician_id')
    .eq('user_id', user!.id)

  const followedIds = (follows ?? []).map((f) => f.politician_id)

  let followedPoliticians: Politician[] = []
  if (followedIds.length > 0) {
    const { data } = await supabase
      .from('politicians')
      .select('*')
      .in('id', followedIds)
      .order('name')
    followedPoliticians = (data ?? []) as Politician[]
  }

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl">Dashboard</h1>
      <p className="mb-10 text-sm text-[var(--codex-sub)]">
        Your personalized political directory
      </p>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          Following ({followedPoliticians.length})
        </h2>
        <Link
          href="/"
          className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
        >
          Browse directory →
        </Link>
      </div>

      {followedPoliticians.length > 0 ? (
        <div>
          {followedPoliticians.map((pol) => (
            <PoliticianCard key={pol.id} politician={pol} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-[var(--codex-border)] py-16 text-center">
          <div className="mb-2 font-serif text-xl text-[var(--codex-faint)]">
            Not following anyone yet
          </div>
          <p className="mb-6 text-sm text-[var(--codex-sub)]">
            Browse the directory and follow politicians to see them here
          </p>
          <Link
            href="/"
            className="rounded-md bg-[var(--codex-badge-bg)] px-4 py-2 text-sm text-[var(--codex-text)] no-underline hover:bg-[var(--codex-hover)]"
          >
            Browse directory
          </Link>
        </div>
      )}
    </div>
  )
}
