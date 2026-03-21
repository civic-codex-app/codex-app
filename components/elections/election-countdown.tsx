'use client'

import { useState, useEffect } from 'react'

interface ElectionCountdownProps {
  electionDate: string // ISO date string like "2026-11-03"
}

export function ElectionCountdown({ electionDate }: ElectionCountdownProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000) // update every minute
    return () => clearInterval(timer)
  }, [])

  const target = new Date(electionDate + 'T00:00:00')
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return (
      <div className="flex items-center gap-2 text-[14px] font-medium text-green-400">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
        Election Day
      </div>
    )
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-baseline gap-1.5">
        <span className="font-serif text-3xl tabular-nums text-[var(--codex-text)]">{days}</span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">
          {days === 1 ? 'day' : 'days'}
        </span>
      </div>
      <span className="text-[var(--codex-border)]">&middot;</span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-serif text-3xl tabular-nums text-[var(--codex-text)]">{hours}</span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">
          {hours === 1 ? 'hour' : 'hours'}
        </span>
      </div>
      <span className="ml-2 text-[12px] text-[var(--codex-faint)]">until Election Day</span>
    </div>
  )
}
