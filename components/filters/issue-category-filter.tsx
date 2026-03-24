'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

interface IssueCategoryFilterProps {
  categories: string[]
  labels: Record<string, string>
}

export function IssueCategoryFilter({ categories, labels }: IssueCategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const current = searchParams.get('category') ?? ''

  function handleClick(category: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (category) {
        params.set('category', category)
      } else {
        params.delete('category')
      }
      router.push(`/issues?${params.toString()}`)
    })
  }

  return (
    <div className="mb-8 flex animate-fade-up flex-nowrap gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" role="radiogroup" aria-label="Filter by issue category">
      <button
        onClick={() => handleClick('')}
        role="radio"
        aria-checked={!current}
        className={cn(
          'shrink-0 whitespace-nowrap rounded-sm px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
          !current
            ? 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)] border-[var(--poli-border)]'
            : 'text-[var(--poli-faint)] hover:text-[var(--poli-sub)] border-transparent'
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          role="radio"
          aria-checked={current === cat}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-sm px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
            current === cat
              ? 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)] border-[var(--poli-border)]'
              : 'text-[var(--poli-faint)] hover:text-[var(--poli-sub)] border-transparent'
          )}
        >
          {labels[cat] ?? cat}
        </button>
      ))}
    </div>
  )
}
