'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const currentQuery = searchParams.get('q') ?? ''
  const [value, setValue] = useState(currentQuery)

  function handleChange(val: string) {
    setValue(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (val.trim()) {
          params.set('q', val.trim())
        } else {
          params.delete('q')
        }
        params.delete('page')
        router.push(`/?${params.toString()}`)
      })
    }, 300)
  }

  function handleClear() {
    setValue('')
    if (inputRef.current) inputRef.current.focus()
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('q')
      params.delete('page')
      router.push(`/?${params.toString()}`)
    })
  }

  return (
    <div className="relative mb-6 animate-fade-up">
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by name, state, or party..."
        aria-label="Search politicians by name, state, or party"
        inputMode="search"
        enterKeyHint="search"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full rounded-xl border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-5 py-3.5 pr-12 font-sans text-[15px] text-[var(--codex-text)] outline-none transition-colors placeholder:text-[var(--codex-faint)] focus:border-[var(--codex-input-focus)] focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)] sm:py-4 sm:text-[14.5px]"
      />
      {/* Clear button */}
      {value && !isPending && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--codex-faint)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-sub)]"
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      {isPending && (
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2" aria-live="polite">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--codex-text)]" />
          <span className="text-xs text-[var(--codex-sub)]">Searching...</span>
        </div>
      )}
    </div>
  )
}
