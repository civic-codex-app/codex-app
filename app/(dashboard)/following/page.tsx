import { createClient } from '@/lib/supabase/server'
import { PoliticianCard } from '@/components/directory/politician-card'
import type { Politician } from '@/lib/types/politician'
import Link from 'next/link'

export default async function FollowingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: follows } = await supabase
    .from('follows')
    .select('politician_id, politicians(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const politicians = (follows ?? [])
    .map((f) => f.politicians)
    .filter(Boolean) as unknown as Politician[]

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Following</h1>
      <p className="mb-10 text-sm text-[var(--codex-sub)]">
        Politicians you&apos;re tracking
      </p>

      {politicians.length > 0 ? (
        <div>
          {politicians.map((pol) => (
            <PoliticianCard key={pol.id} politician={pol} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-[var(--codex-border)] py-16 text-center">
          <div className="mb-2 text-xl font-semibold text-[var(--codex-faint)]">
            Not following anyone yet
          </div>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-[var(--codex-badge-bg)] px-4 py-2 text-sm text-[var(--codex-text)] no-underline"
          >
            Browse directory
          </Link>
        </div>
      )}
    </div>
  )
}
