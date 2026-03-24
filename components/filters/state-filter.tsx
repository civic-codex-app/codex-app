'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { US_STATES, STATE_NAMES } from '@/lib/constants/us-states'

export function StateFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const current = searchParams.get('state') ?? ''

  function handleChange(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('state', value)
      } else {
        params.delete('state')
      }
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Filter by state"
      className="h-9 rounded-sm border border-[var(--poli-border)] bg-[var(--poli-input-bg)] px-3 text-[12px] text-[var(--poli-text)] outline-none transition-colors focus:border-[var(--poli-input-focus)] appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
    >
      <option value="">All States</option>
      {US_STATES.map((s) => (
        <option key={s} value={s}>
          {s} — {STATE_NAMES[s]}
        </option>
      ))}
    </select>
  )
}
