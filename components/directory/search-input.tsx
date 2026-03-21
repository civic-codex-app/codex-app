'use client'

import { useRef, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const currentQuery = searchParams.get('q') ?? ''

  function handleChange(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value.trim()) {
          params.set('q', value.trim())
        } else {
          params.delete('q')
        }
        router.push(`/?${params.toString()}`)
      })
    }, 300)
  }

  return (
    <div className="relative mb-6 animate-fade-up">
      <input
        ref={inputRef}
        type="search"
        defaultValue={currentQuery}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by name, state, or party..."
        aria-label="Search politicians by name, state, or party"
        className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-5 py-4 font-sans text-[14.5px] text-[var(--codex-text)] outline-none transition-colors placeholder:text-[var(--codex-faint)] focus:border-[var(--codex-input-focus)] focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]"
      />
      {isPending && (
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2" aria-live="polite">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--codex-text)]" />
          <span className="text-xs text-[var(--codex-sub)]">Searching...</span>
        </div>
      )}
    </div>
  )
}
