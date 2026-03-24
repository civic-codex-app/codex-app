'use client'

import { useRouter } from 'next/navigation'
import { US_STATES, STATE_NAMES } from '@/lib/constants/us-states'

export function StateFilterSelect({ current }: { current: string }) {
  const router = useRouter()

  return (
    <select
      value={current}
      onChange={(e) => {
        const val = e.target.value
        router.push(val ? `/community?state=${val}` : '/community')
      }}
      className="rounded-md border border-[var(--poli-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--poli-sub)]"
      aria-label="Filter by state"
    >
      <option value="">Filter by state...</option>
      {US_STATES.map((s) => (
        <option key={s} value={s}>
          {STATE_NAMES[s as keyof typeof STATE_NAMES] ?? s}
        </option>
      ))}
    </select>
  )
}
