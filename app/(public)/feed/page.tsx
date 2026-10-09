import { unstable_cache } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AppShell } from '@/components/app/surface'
import { FeedView, type NationalStory } from '@/components/feed/feed-view'

/**
 * The feed.
 *
 * Prerendered and refreshed every ten minutes: it reads no cookies and no
 * searchParams. It used to await party/state/page filters over a votes table
 * that holds zero rows, so every view was a full render of an empty list.
 * The personal half — the visitor's race and people — resolves on the client
 * from /api/feed/mine; this page carries today's national headlines from
 * `daily_topics`, which the daily cron keeps current.
 */
export const revalidate = 600

export const metadata = {
  title: 'Feed | Poli',
  description: 'Your race, your officials, and today’s political headlines, newest first.',
}

const getNational = unstable_cache(
  async (): Promise<{ stories: NationalStory[]; count: number }> => {
    const supabase = createServiceRoleClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data, count } = await supabase
      .from('daily_topics')
      .select('title, summary, source_name, source_url, published_at, issues:issue_id(name)', { count: 'exact' })
      .eq('is_active', true)
      .gte('published_at', since)
      .order('published_at', { ascending: false })
      .limit(6)
    const stories = ((data ?? []) as any[]).map((r) => ({
      title: r.title,
      summary: r.summary ?? null,
      source: r.source_name ?? null,
      url: r.source_url ?? null,
      time: new Date(r.published_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }),
      issue: r.issues?.name ? String(r.issues.name).split(/ & | and /)[0] : null,
    }))
    return { stories, count: count ?? stories.length }
  },
  ['feed-national'],
  { revalidate: 600, tags: ['daily-topics'] }
)

export default async function FeedPage() {
  const { stories, count } = await getNational()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' })

  return (
    <AppShell>
      <div className="mx-auto max-w-[560px] px-4 pt-5">
        <FeedView national={stories} nationalCount={count} today={today} />
      </div>
    </AppShell>
  )
}
