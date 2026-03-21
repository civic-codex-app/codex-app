import { Suspense } from 'react'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { IssueIcon } from '@/components/icons/issue-icon'
import { IssueCategoryFilter } from '@/components/filters/issue-category-filter'
import Link from 'next/link'
import type { IssueWithStancesRow } from '@/lib/types/supabase'

export const metadata = {
  title: 'Issues -- Codex',
  description: 'Explore political issues and see where politicians stand.',
}

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Economy',
  healthcare: 'Healthcare',
  immigration: 'Immigration',
  education: 'Education',
  defense: 'Defense',
  environment: 'Environment',
  justice: 'Justice',
  foreign_policy: 'Foreign Policy',
  technology: 'Technology',
  social: 'Social',
  gun_policy: 'Gun Policy',
  infrastructure: 'Infrastructure',
  housing: 'Housing',
  energy: 'Energy',
}

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function IssuesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  let query = supabase
    .from('issues')
    .select('*, politician_issues(id, stance)')
    .order('name')

  if (params.category) {
    query = query.eq('category', params.category)
  }

  const { data: issues, error: issuesError } = await query
  if (issuesError) console.error('Failed to fetch issues:', issuesError.message)

  if (!issues) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 font-serif text-2xl text-[var(--codex-text)]">Something went wrong</div>
            <p className="text-sm text-[var(--codex-sub)]">
              We couldn&apos;t load political issues right now. Please try again later.
            </p>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  const issuesList = issues as any as IssueWithStancesRow[]

  // Group by category
  const grouped = issuesList.reduce(
    (acc: Record<string, IssueWithStancesRow[]>, issue) => {
      const cat = issue.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(issue)
      return acc
    },
    {}
  )

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="mb-10 max-w-[600px]">
          <h1 className="mb-4 animate-fade-up font-serif text-[clamp(32px,4vw,52px)] font-normal leading-[1.1]">
            Political <span className="italic text-[var(--codex-subtle)]">Issues</span>
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            Explore where politicians stand on the issues that matter most.
          </p>
        </div>

        {/* Category filter */}
        <Suspense>
          <IssueCategoryFilter categories={Object.keys(CATEGORY_LABELS)} labels={CATEGORY_LABELS} />
        </Suspense>

        {Object.entries(grouped).length > 0 ? (
          Object.entries(grouped).map(([category, catIssues]) => (
            <section key={category} className="mb-12">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {catIssues.map((issue) => {
                  const stances = issue.politician_issues ?? []
                  const total = stances.length
                  const supports = stances.filter((s) => ['strongly_supports', 'supports', 'leans_support'].includes(s.stance)).length
                  const opposes = stances.filter((s) => ['strongly_opposes', 'opposes', 'leans_oppose'].includes(s.stance)).length
                  const mixed = stances.filter((s) => ['mixed', 'neutral'].includes(s.stance)).length

                  return (
                    <Link
                      key={issue.id}
                      href={`/issues/${issue.slug}`}
                      className="group block rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5 no-underline transition-all hover:border-[var(--codex-input-border)]"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <IssueIcon icon={issue.icon} size={18} className="text-[var(--codex-sub)]" />
                        <h3 className="font-serif text-lg transition-colors group-hover:text-[var(--codex-text)]">
                          {issue.name}
                        </h3>
                      </div>
                      {issue.description && (
                        <p className="mb-3 line-clamp-2 text-sm text-[var(--codex-sub)]">{issue.description}</p>
                      )}

                      {/* Stance breakdown bar */}
                      {total > 0 && (
                        <div className="mb-2">
                          <div className="flex h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
                            {supports > 0 && (
                              <div
                                className="bg-green-500/60 transition-all"
                                style={{ width: `${(supports / total) * 100}%` }}
                              />
                            )}
                            {mixed > 0 && (
                              <div
                                className="bg-yellow-500/60 transition-all"
                                style={{ width: `${(mixed / total) * 100}%` }}
                              />
                            )}
                            {opposes > 0 && (
                              <div
                                className="bg-red-500/60 transition-all"
                                style={{ width: `${(opposes / total) * 100}%` }}
                              />
                            )}
                          </div>
                          <div className="mt-1.5 flex gap-3 text-[11px] text-[var(--codex-faint)]">
                            {supports > 0 && <span className="text-green-400/70">{supports} support</span>}
                            {mixed > 0 && <span className="text-yellow-400/70">{mixed} mixed</span>}
                            {opposes > 0 && <span className="text-red-400/70">{opposes} oppose</span>}
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] text-[var(--codex-faint)]">
                        {total} politician stance{total !== 1 ? 's' : ''}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="py-20 text-center text-[var(--codex-faint)]">
            <div className="mb-2 font-serif text-2xl">No issues found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
