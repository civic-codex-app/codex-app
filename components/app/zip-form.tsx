'use client'

import { useState } from 'react'

/** One field and the Marker button, for every screen that needs a ZIP before it can be personal. */
export function ZipForm({
  onSubmit,
  error,
  label = 'Show me',
}: {
  onSubmit: (zip: string) => boolean
  error: string | null
  label?: string
}) {
  const [draft, setDraft] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (onSubmit(draft)) setDraft('')
      }}
    >
      <div className="flex gap-2">
        <label htmlFor="zip-form-input" className="sr-only">
          ZIP code
        </label>
        <input
          id="zip-form-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          placeholder="ZIP code"
          className="h-12 min-w-0 flex-1 rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] px-4 text-[16px] font-semibold tracking-[0.06em] text-[var(--poli-text)] outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-[var(--poli-faint)] focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-xl bg-[var(--poli-marker)] px-5 text-[14px] font-semibold text-[var(--poli-marker-ink)]"
        >
          {label}
        </button>
      </div>
      {error && <p className="mt-2 text-[12.5px] text-[var(--poli-app-warn-ink)]">{error}</p>}
    </form>
  )
}
