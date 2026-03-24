'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { partyColor } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'

interface Suggestion {
  id: string
  name: string
  slug: string
  title: string | null
  state: string | null
  party: string | null
  image_url: string | null
}

interface CompareSelectorProps {
  selectedA: string
  selectedB: string
  nameA?: string
  nameB?: string
}

function PoliticianAutocomplete({
  label,
  selectedSlug,
  selectedName,
  onSelect,
  placeholder = 'Search for a politician...',
}: {
  label: string
  selectedSlug: string
  selectedName?: string
  onSelect: (slug: string) => void
  placeholder?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const autocompleteTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [value, setValue] = useState(selectedName ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Sync external name changes (e.g. swap)
  useEffect(() => {
    setValue(selectedName ?? '')
  }, [selectedName, selectedSlug])

  const fetchSuggestions = useCallback((query: string) => {
    if (autocompleteTimerRef.current) clearTimeout(autocompleteTimerRef.current)

    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      setActiveIndex(-1)
      return
    }

    autocompleteTimerRef.current = setTimeout(async () => {
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
        // Aborted or network error
      }
    }, 200)
  }, [])

  function handleChange(val: string) {
    setValue(val)
    fetchSuggestions(val)
  }

  function handleClear() {
    setValue('')
    setSuggestions([])
    setShowDropdown(false)
    setActiveIndex(-1)
    onSelect('')
    if (inputRef.current) inputRef.current.focus()
  }

  function selectSuggestion(s: Suggestion) {
    setShowDropdown(false)
    setSuggestions([])
    setActiveIndex(-1)
    setValue(s.name)
    onSelect(s.slug)
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

  // Close dropdown on outside click
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
    <div className="relative flex-1">
      <label className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-[var(--poli-faint)]">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true)
          }}
          placeholder={placeholder}
          aria-label={`Search ${label}`}
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `compare-suggestion-${label}-${activeIndex}` : undefined
          }
          role="combobox"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          className="w-full rounded-md border border-[var(--poli-border)] bg-[var(--poli-input-bg)] px-3 py-2.5 pr-9 text-[13px] text-[var(--poli-text)] outline-none transition-colors placeholder:text-[var(--poli-faint)] focus:border-[var(--poli-input-focus)]"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--poli-faint)] transition-colors hover:bg-[var(--poli-hover)] hover:text-[var(--poli-sub)]"
            aria-label="Clear selection"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[320px] overflow-y-auto rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] shadow-lg"
        >
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              id={`compare-suggestion-${label}-${i}`}
              data-suggestion
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                selectSuggestion(s)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                i === activeIndex
                  ? 'bg-[var(--poli-hover)]'
                  : 'hover:bg-[var(--poli-hover)]'
              } ${i < suggestions.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}
            >
              {s.image_url ? (
                <Image
                  src={s.image_url}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: s.party
                      ? `${partyColor(s.party)}18`
                      : 'var(--poli-hover)',
                  }}
                >
                  {s.party && <PartyIcon party={s.party} size={12} />}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-[var(--poli-text)]">
                  {s.name}
                </div>
                <div className="truncate text-[11px] text-[var(--poli-sub)]">
                  {[s.title, s.state, s.party].filter(Boolean).join(' \u00b7 ')}
                </div>
              </div>

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

export function CompareSelector({ selectedA, selectedB, nameA, nameB }: CompareSelectorProps) {
  const router = useRouter()

  function update(side: 'a' | 'b', slug: string) {
    const params = new URLSearchParams()
    if (side === 'a') {
      if (slug) params.set('a', slug)
      if (selectedB) params.set('b', selectedB)
    } else {
      if (selectedA) params.set('a', selectedA)
      if (slug) params.set('b', slug)
    }
    router.push(`/compare?${params.toString()}`)
  }

  function swap() {
    if (!selectedA && !selectedB) return
    const params = new URLSearchParams()
    if (selectedB) params.set('a', selectedB)
    if (selectedA) params.set('b', selectedA)
    router.push(`/compare?${params.toString()}`)
  }

  return (
    <div className="mb-10 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <PoliticianAutocomplete
          label="Official A"
          selectedSlug={selectedA}
          selectedName={nameA}
          onSelect={(slug) => update('a', slug)}
        />

        <button
          onClick={swap}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center self-center rounded-full border border-[var(--poli-border)] text-[var(--poli-faint)] transition-all hover:border-[var(--poli-input-focus)] hover:text-[var(--poli-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)] sm:mt-5"
          title="Swap"
          aria-label="Swap officials A and B"
        >
          <span className="sm:hidden">&#8645;</span>
          <span className="hidden sm:inline">&#8644;</span>
        </button>

        <PoliticianAutocomplete
          label="Official B"
          selectedSlug={selectedB}
          selectedName={nameB}
          onSelect={(slug) => update('b', slug)}
        />
      </div>
    </div>
  )
}
