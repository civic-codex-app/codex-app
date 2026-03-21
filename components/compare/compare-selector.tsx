'use client'

import { useRouter } from 'next/navigation'
import { partyColor } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'

interface Politician {
  id: string
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  image_url: string | null
  title: string
}

interface CompareSelectorProps {
  politicians: Politician[]
  selectedA: string
  selectedB: string
}

export function CompareSelector({ politicians, selectedA, selectedB }: CompareSelectorProps) {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-[var(--codex-faint)]">
            Official A
          </label>
          <select
            value={selectedA}
            onChange={(e) => update('a', e.target.value)}
            className="w-full rounded-md border border-[var(--codex-border)] bg-[var(--codex-input-bg)] px-3 py-2.5 text-[13px] text-[var(--codex-text)] outline-none transition-colors focus:border-[var(--codex-input-focus)]"
          >
            <option value="">Select a politician...</option>
            {politicians.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name} — {p.state} ({p.party.charAt(0).toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swap}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center self-center rounded-full border border-[var(--codex-border)] text-[var(--codex-faint)] transition-all hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)] sm:mt-5"
          title="Swap"
          aria-label="Swap officials A and B"
        >
          <span className="sm:hidden">⇅</span>
          <span className="hidden sm:inline">⇄</span>
        </button>

        <div className="flex-1">
          <label className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-[var(--codex-faint)]">
            Official B
          </label>
          <select
            value={selectedB}
            onChange={(e) => update('b', e.target.value)}
            className="w-full rounded-md border border-[var(--codex-border)] bg-[var(--codex-input-bg)] px-3 py-2.5 text-[13px] text-[var(--codex-text)] outline-none transition-colors focus:border-[var(--codex-input-focus)]"
          >
            <option value="">Select a politician...</option>
            {politicians.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name} — {p.state} ({p.party.charAt(0).toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
