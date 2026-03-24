import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

interface HotTopicsProps {
  followedIssueIds?: string[]
}

export async function HotTopics({ followedIssueIds }: HotTopicsProps) {
  const supabase = createServiceRoleClient()

  const { data: topics } = await supabase
    .from('daily_topics')
    .select(`
      id,
      title,
      summary,
      source_url,
      source_name,
      published_at,
      issue_id,
      issues(name, slug)
    `)
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(8)

  if (!topics || topics.length === 0) return null

  // If user follows issues, prioritize those topics
  let sorted = topics
  if (followedIssueIds && followedIssueIds.length > 0) {
    const followed = topics.filter(t => t.issue_id && followedIssueIds.includes(t.issue_id))
    const rest = topics.filter(t => !t.issue_id || !followedIssueIds.includes(t.issue_id))
    sorted = [...followed, ...rest]
  }

  // Show top 4
  const display = sorted.slice(0, 4)

  return (
    <div className="mb-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
          Today in Politics
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {display.map((topic) => {
          const issue = topic.issues as unknown as { name: string; slug: string } | null
          const timeAgo = getTimeAgo(topic.published_at)

          return (
            <div
              key={topic.id}
              className="group rounded-xl border border-[var(--poli-border)] p-4 transition-all hover:border-[var(--poli-text)]/30"
            >
              {/* Issue tag + time */}
              <div className="mb-2 flex items-center gap-2">
                {issue && (
                  <Link
                    href={`/issues/${issue.slug}`}
                    className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 no-underline hover:bg-blue-500/20"
                  >
                    {issue.name}
                  </Link>
                )}
                <span className="text-[10px] text-[var(--poli-faint)]">{timeAgo}</span>
              </div>

              {/* Headline */}
              <a
                href={topic.source_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1 block text-[14px] font-semibold leading-snug text-[var(--poli-text)] no-underline hover:underline"
              >
                {topic.title}
              </a>

              {/* Source */}
              {topic.source_name && (
                <div className="text-[11px] text-[var(--poli-faint)]">
                  {topic.source_name}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}
