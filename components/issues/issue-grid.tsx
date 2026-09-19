'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IssueIcon } from '@/components/icons/issue-icon'
import { IssueCategoryFilterView } from '@/components/filters/issue-category-filter'
import { IssueSortSelectView } from '@/components/filters/issue-sort-select'
import { ISSUE_SUBTITLES } from '@/lib/data/educational-content'

export type IssueCard = {
  id: string
  slug: string
  name: string
  icon: string | null
  description: string | null
  category: string | null
  total: number
  supports: number
  opposes: number
  mixed: number
  officials: number
}

type SortKey = 'name' | 'most_controversial'
// most_stances is accepted from a URL for back-compatibility with links
// already shared, but it is no longer offered: see issue-sort-select.
const SORT_KEYS: readonly string[] = ['name', 'most_controversial']

/**
 * The issues list, filtered and sorted in the browser.
 *
 * This used to be server-side: `category` narrowed a Supabase query and `sort`
 * reordered the result, both read from searchParams. Awaiting searchParams is
 * what makes a route dynamic, so the page declared a one-hour revalidate it
 * could never use and re-rendered for every visitor — to reorder 22 rows.
 *
 * The whole catalogue is 22 issues with a dozen aggregate numbers each, so it
 * ships once and every filter and sort is a repaint rather than a round trip.
 * The URL still carries the selection, via replaceState, so links stay
 * shareable and Back still works.
 */
export function IssueGrid({
  issues,
  categoryLabels,
  totalStances,
}: {
  issues: IssueCard[]
  categoryLabels: Record<string, string>
  totalStances: number
}) {
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<SortKey>('name')

  // Seeded after mount, not from useSearchParams: that hook would opt this
  // component out of prerendering and take the whole list out of the cached
  // HTML.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get('category')
    const s = params.get('sort')
    if (c && categoryLabels[c]) setCategory(c)
    if (s && SORT_KEYS.includes(s)) setSort(s as SortKey)
  }, [categoryLabels])

  function syncUrl(next: { category?: string; sort?: SortKey }) {
    const params = new URLSearchParams(window.location.search)
    const c = next.category ?? category
    const s = next.sort ?? sort
    if (c) params.set('category', c)
    else params.delete('category')
    if (s !== 'name') params.set('sort', s)
    else params.delete('sort')
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }

  const visible = issues.filter((i) => !category || i.category === category)
  const sorted = [...visible].sort((a, b) => {
    if (sort === 'most_controversial') {
      // The balance ratio the server used: how close support and opposition
      // are to even, highest first. Kept identical so the ordering does not
      // quietly change when the work moves to the client.
      const balance = (i: IssueCard) => Math.min(i.supports, i.opposes) / Math.max(i.supports, i.opposes, 1)
      return balance(b) - balance(a)
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-6 border-y border-[var(--poli-border)] py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">{visible.length}</span>
          <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">Issues</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">{totalStances.toLocaleString()}</span>
          <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">Total Stances</span>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <IssueCategoryFilterView
          categories={Object.keys(categoryLabels)}
          labels={categoryLabels}
          value={category}
          onChange={(c) => {
            setCategory(c)
            syncUrl({ category: c })
          }}
        />
        <IssueSortSelectView
          value={sort}
          onChange={(s) => {
            setSort(s as SortKey)
            syncUrl({ sort: s as SortKey })
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((issue) => (
          <Link
            key={issue.id}
            href={`/issues/${issue.slug}`}
            className="group block cursor-pointer rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] p-5 no-underline transition-all duration-200 hover:border-[var(--poli-input-border)] hover:shadow-md"
          >
            <div className="mb-2 flex items-center gap-2">
              <IssueIcon icon={issue.icon} size={18} className="text-[var(--poli-sub)]" />
              <h3 className="text-lg font-semibold transition-colors group-hover:text-[var(--poli-text)]">
                {issue.name}
              </h3>
            </div>

            {ISSUE_SUBTITLES[issue.slug] && (
              <p className="mb-1.5 text-[12px] italic text-[var(--poli-faint)]">{ISSUE_SUBTITLES[issue.slug]}</p>
            )}

            {issue.description && (
              <p className="mb-3 line-clamp-2 text-[13px] text-[var(--poli-sub)]">{issue.description}</p>
            )}

            {issue.total > 0 && (
              <div className="mb-3">
                <div className="flex h-2 overflow-hidden rounded-full bg-[var(--poli-border)]">
                  {issue.supports > 0 && <div style={{ width: `${(issue.supports / issue.total) * 100}%`, background: '#2563EB' }} />}
                  {issue.mixed > 0 && <div style={{ width: `${(issue.mixed / issue.total) * 100}%`, background: '#8B5CF6' }} />}
                  {issue.opposes > 0 && <div style={{ width: `${(issue.opposes / issue.total) * 100}%`, background: '#DC2626' }} />}
                </div>
                <div className="mt-1.5 flex gap-3 text-[11px] text-[var(--poli-faint)]">
                  <span style={{ color: '#2563EB' }}>{Math.round((issue.supports / issue.total) * 100)}% Favor</span>
                  <span className="text-[var(--poli-faint)]">&middot;</span>
                  <span style={{ color: '#8B5CF6' }}>{Math.round((issue.mixed / issue.total) * 100)}% Mixed</span>
                  <span className="text-[var(--poli-faint)]">&middot;</span>
                  <span style={{ color: '#DC2626' }}>{Math.round((issue.opposes / issue.total) * 100)}% Oppose</span>
                </div>
              </div>
            )}

            <div className="text-[10px] text-[var(--poli-faint)]">
              {issue.officials.toLocaleString()} officials with stances
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
