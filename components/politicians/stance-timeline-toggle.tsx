'use client'

import { useState } from 'react'

interface StanceTimelineToggleProps {
  hasHistory: boolean
  children: React.ReactNode
}

export function StanceTimelineToggle({ hasHistory, children }: StanceTimelineToggleProps) {
  const [open, setOpen] = useState(false)

  if (!hasHistory) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group flex items-center gap-1 text-[11px] text-[var(--poli-sub)] transition-colors hover:text-[var(--poli-text)]"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <path
            d="M4.5 2.5L8 6L4.5 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>View timeline</span>
      </button>

      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}
