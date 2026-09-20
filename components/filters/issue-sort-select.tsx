'use client'

import { SortFilter, SortFilterView } from './sort-filter'

// "Most Stances" was removed because it could never reorder anything. Every
// politician holds a stance on every issue — 8,584 x 22 — so all 22 issues
// report exactly 8,584 stances and sorting by that count is the identity.
// Verified against the rendered page: ?sort=most_stances returned byte-for-byte
// the alphabetical order. A control that cannot do what it says is the same
// class of problem as data that claims to be measured when it is estimated.
//
// If stance coverage ever stops being uniform, this is one line to restore.
const ISSUE_SORT_OPTIONS = [
  { key: 'name', label: 'Alphabetical' },
  { key: 'most_controversial', label: 'Most Controversial' },
]

/** Local sort, for a page that holds the value itself and stays cacheable. */
export function IssueSortSelectView({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return <SortFilterView options={ISSUE_SORT_OPTIONS} value={value} onChange={onChange} />
}

/** Router-driven sort, for pages that need the server to re-query. */
export function IssueSortSelect() {
  return <SortFilter options={ISSUE_SORT_OPTIONS} defaultSort="name" />
}
