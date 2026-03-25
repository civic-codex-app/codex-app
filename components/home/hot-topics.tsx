import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Issue pill colors by category — avoids the all-blue-looks-Democrat problem
const ISSUE_PILL_COLORS: Record<string, { bg: string; text: string; hover: string }> = {
  'immigration-and-border-security': { bg: 'bg-orange-500/10', text: 'text-orange-400', hover: 'hover:bg-orange-500/20' },
  'economy-and-jobs':                { bg: 'bg-emerald-500/10', text: 'text-emerald-400', hover: 'hover:bg-emerald-500/20' },
  'healthcare-and-medicare':         { bg: 'bg-rose-500/10', text: 'text-rose-400', hover: 'hover:bg-rose-500/20' },
  'climate-and-environment':         { bg: 'bg-green-500/10', text: 'text-green-400', hover: 'hover:bg-green-500/20' },
  'gun-policy-and-2nd-amendment':    { bg: 'bg-red-500/10', text: 'text-red-400', hover: 'hover:bg-red-500/20' },
  'education-and-student-debt':      { bg: 'bg-violet-500/10', text: 'text-violet-400', hover: 'hover:bg-violet-500/20' },
  'national-defense-and-military':   { bg: 'bg-slate-500/10', text: 'text-slate-400', hover: 'hover:bg-slate-500/20' },
  'foreign-policy-and-diplomacy':    { bg: 'bg-cyan-500/10', text: 'text-cyan-400', hover: 'hover:bg-cyan-500/20' },
  'technology-and-ai-regulation':    { bg: 'bg-indigo-500/10', text: 'text-indigo-400', hover: 'hover:bg-indigo-500/20' },
  'criminal-justice-reform':         { bg: 'bg-amber-500/10', text: 'text-amber-400', hover: 'hover:bg-amber-500/20' },
  'social-security-and-medicare':    { bg: 'bg-teal-500/10', text: 'text-teal-400', hover: 'hover:bg-teal-500/20' },
  'infrastructure-and-transportation': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', hover: 'hover:bg-yellow-500/20' },
  'housing-and-affordability':       { bg: 'bg-lime-500/10', text: 'text-lime-400', hover: 'hover:bg-lime-500/20' },
  'energy-policy-and-oil-gas':       { bg: 'bg-orange-500/10', text: 'text-orange-400', hover: 'hover:bg-orange-500/20' },
  'reproductive-rights':             { bg: 'bg-pink-500/10', text: 'text-pink-400', hover: 'hover:bg-pink-500/20' },
  'lgbtq-rights':                    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', hover: 'hover:bg-fuchsia-500/20' },
  'drug-policy':                     { bg: 'bg-purple-500/10', text: 'text-purple-400', hover: 'hover:bg-purple-500/20' },
  'voting-rights':                   { bg: 'bg-sky-500/10', text: 'text-sky-400', hover: 'hover:bg-sky-500/20' },
  'taxes-and-spending':              { bg: 'bg-emerald-500/10', text: 'text-emerald-400', hover: 'hover:bg-emerald-500/20' },
  'labor-and-unions':                { bg: 'bg-amber-500/10', text: 'text-amber-400', hover: 'hover:bg-amber-500/20' },
  'privacy-and-surveillance':        { bg: 'bg-zinc-500/10', text: 'text-zinc-400', hover: 'hover:bg-zinc-500/20' },
  'trade-and-tariffs':               { bg: 'bg-yellow-500/10', text: 'text-yellow-400', hover: 'hover:bg-yellow-500/20' },
}
const DEFAULT_PILL = { bg: 'bg-zinc-500/10', text: 'text-zinc-400', hover: 'hover:bg-zinc-500/20' }

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
          const pill = issue ? (ISSUE_PILL_COLORS[issue.slug] ?? DEFAULT_PILL) : DEFAULT_PILL

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
                    className={`rounded-full ${pill.bg} px-2 py-0.5 text-[10px] font-semibold ${pill.text} no-underline ${pill.hover}`}
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

              {/* Summary excerpt */}
              {topic.summary && (
                <p className="mb-1.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--poli-sub)]">
                  {topic.summary}
                </p>
              )}

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
