'use client'

import { SortFilter } from './sort-filter'

const ISSUE_SORT_OPTIONS = [
  { key: 'name', label: 'Alphabetical' },
  { key: 'most_stances', label: 'Most Stances' },
  { key: 'most_controversial', label: 'Most Controversial' },
]

interface IssueSortSelectProps {
  currentSort?: string
}

export function IssueSortSelect({ currentSort }: IssueSortSelectProps) {
  return <SortFilter options={ISSUE_SORT_OPTIONS} defaultSort="name" />
}
