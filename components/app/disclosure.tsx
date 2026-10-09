'use client'

import { useState } from 'react'

/**
 * A row that opens in place. The quiet screens' second move, after the sheet:
 * the row shows the one line that matters and the chevron, and the detail
 * waits until it is asked for. Stack several inside a flush Card.
 */
export function Disclosure({
  title,
  meta,
  leading,
  trailing,
  children,
  defaultOpen = false,
  last = false,
}: {
  title: React.ReactNode
  meta?: React.ReactNode
  /** Faces or an icon, drawn before the title. */
  leading?: React.ReactNode
  /** A chip or a number, drawn before the chevron. */
  trailing?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  last?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={last ? '' : 'border-b border-[var(--poli-border)]'}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[56px] w-full items-center gap-3 py-2 text-left"
      >
        {leading}
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-[1.3] text-[var(--poli-text)]">{title}</span>
          {meta && <span className="mt-0.5 block text-[12.5px] text-[var(--poli-sub)]">{meta}</span>}
        </span>
        {trailing}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0 text-[var(--poli-faint)] transition-transform duration-3 ease-out"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="animate-fade-up pb-4">{children}</div>}
    </div>
  )
}
