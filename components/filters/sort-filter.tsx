'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

interface SortOption {
  key: string
  label: string
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

  function handleChange(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== defaultSort) {
        params.set('sort', value)
      } else {
        params.delete('sort')
      }
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 rounded-sm border border-[var(--codex-border)] bg-[var(--codex-input-bg)] px-3 text-[12px] text-[var(--codex-text)] outline-none transition-colors focus:border-[var(--codex-input-focus)] appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
    >
      {options.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
