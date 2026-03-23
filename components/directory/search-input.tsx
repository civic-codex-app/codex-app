'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'

interface Suggestion {
  id: string
  name: string
  slug: string
  title: string | null
  state: string | null
  party: string | null
  image_url: string | null
}

export function SearchInput({ size = 'default', basePath }: { size?: 'default' | 'lg'; basePath?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const autocompleteTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const currentQuery = searchParams.get('q') ?? ''
  const [value, setValue] = useState(currentQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const abortRef = useRef<AbortController | null>(null)

  // Fetch autocomplete suggestions with debounce
  const fetchSuggestions = useCallback((query: string) => {
    if (autocompleteTimerRef.current) clearTimeout(autocompleteTimerRef.current)

    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      setActiveIndex(-1)
      return
    }

    autocompleteTimerRef.current = setTimeout(async () => {
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        )
        if (!res.ok) return
        const data: Suggestion[] = await res.json()
        setSuggestions(data)
        setShowDropdown(data.length > 0)
        setActiveIndex(-1)
      } catch {
        // Aborted or network error — ignore
      }
    }, 100)
  }, [])

  // Directory filtering (existing behavior)
  function pushSearch(val: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (val.trim()) {
        params.set('q', val.trim())
      } else {
        params.delete('q')
      }
      params.delete('page')
      const base = basePath ?? '/'
      router.push(`${base}?${params.toString()}`)
    })
  }

  function handleChange(val: string) {
    setValue(val)
    fetchSuggestions(val)
    // Only push search params on the homepage (no basePath)
    if (!basePath) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => pushSearch(val), 300)
    }
  }

  function handleClear() {
    setValue('')
    setSuggestions([])
    setShowDropdown(false)
    setActiveIndex(-1)
    if (inputRef.current) inputRef.current.focus()
    if (!basePath) pushSearch('')
  }

  function selectSuggestion(suggestion: Suggestion) {
    setShowDropdown(false)
    setSuggestions([])
    setActiveIndex(-1)
    setValue(suggestion.name)
    router.push(`/politicians/${suggestion.slug}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setActiveIndex(-1)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !dropdownRef.current) return
    const items = dropdownRef.current.querySelectorAll('[data-suggestion]')
    items[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <div className="relative mb-6 animate-fade-up">
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true)
        }}
        placeholder="Search by name, state, or party..."
        aria-label="Search politicians by name, state, or party"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        aria-activedescendant={
          activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
        }
        role="combobox"
        inputMode="search"
        enterKeyHint="search"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        className={`w-full rounded-xl border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] pr-12 font-sans text-[var(--codex-text)] outline-none transition-colors placeholder:text-[var(--codex-faint)] focus:border-[var(--codex-input-focus)] focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${
          size === 'lg'
            ? 'h-12 px-5 text-base sm:h-14 sm:text-[16px]'
            : 'px-5 py-3.5 text-[15px] sm:py-4 sm:text-[14.5px]'
        }`}
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

      {/* Autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[360px] overflow-y-auto rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)] shadow-lg"
        >
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              id={`suggestion-${i}`}
              data-suggestion
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                selectSuggestion(s)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === activeIndex
                  ? 'bg-[var(--codex-hover)]'
                  : 'hover:bg-[var(--codex-hover)]'
              } ${i < suggestions.length - 1 ? 'border-b border-[var(--codex-border)]' : ''}`}
            >
              {/* Avatar / party icon area */}
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt={s.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: s.party
                      ? `${partyColor(s.party)}18`
                      : 'var(--codex-hover)',
                  }}
                >
                  {s.party && <PartyIcon party={s.party} size={14} />}
                </div>
              )}

              {/* Name + metadata */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium text-[var(--codex-text)]">
                  {s.name}
                </div>
                <div className="truncate text-[12px] text-[var(--codex-sub)]">
                  {[s.title, s.state, s.party]
                    .filter(Boolean)
                    .join(' \u00b7 ')}
                </div>
              </div>

              {/* Party color dot */}
              {s.party && (
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: partyColor(s.party) }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
