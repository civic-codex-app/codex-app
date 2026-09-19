'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

interface SortOption {
  key: string
  label: string
}

/**
 * The control itself, with no router and — importantly — no useSearchParams.
 *
 * That hook opts a client component out of static prerendering, so a page
 * holding one cannot be served as cached HTML with the control in it (the
 * homepage lost its whole search box to exactly this). /issues sorts 22 items
 * locally and needs to stay cacheable, so it renders this directly.
 * SortFilter below is the router-driven wrapper for the pages that genuinely
 * need the server to re-query.
 */
export function SortFilterView({
  options,
  value,
  onChange,
}: {
  options: SortOption[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort by"
      className="h-9 rounded-sm border border-[var(--poli-border)] bg-[var(--poli-input-bg)] px-3 text-[12px] text-[var(--poli-text)] outline-none transition-colors focus:border-[var(--poli-input-focus)] appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
      }}
    >
      {options.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

interface SortFilterProps {
  options: SortOption[]
  defaultSort?: string
}

export function SortFilter({ options, defaultSort = '' }: SortFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const current = searchParams.get('sort') ?? defaultSort

  function handleChange(next: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (next && next !== defaultSort) {
        params.set('sort', next)
      } else {
        params.delete('sort')
      }
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return <SortFilterView options={options} value={current} onChange={handleChange} />
}
