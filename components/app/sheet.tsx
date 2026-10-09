'use client'

import { useEffect } from 'react'

/**
 * The bottom sheet: where a screen keeps what it does not show.
 *
 * Sources, the "why estimated" note, a candidate's numbers, a news story's
 * summary. A scrim, a 24px-radius sheet, a grab handle, and whatever the
 * caller puts in it. Escape and the scrim both close it. It sits above the
 * tab bar (z-40) and the header (z-50).
 */
export function BottomSheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="poli-fade absolute inset-0 h-full w-full cursor-pointer bg-[var(--poli-overlay)]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="poli-sheet absolute inset-x-0 bottom-0 mx-auto max-h-[85vh] max-w-[560px] overflow-y-auto rounded-t-3xl bg-[var(--poli-card)] px-5 pt-2.5 text-[var(--poli-text)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[var(--poli-border)]" />
        {children}
      </div>
    </div>
  )
}

/** The sheet's dismiss button, the same on every sheet. */
export function SheetDone({ onClick, children = 'Done' }: { onClick: () => void; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 h-12 w-full rounded-xl bg-[var(--poli-badge-bg)] text-[15px] font-semibold text-[var(--poli-text)]"
    >
      {children}
    </button>
  )
}
