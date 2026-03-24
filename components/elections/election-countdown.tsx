'use client'

import { useState, useEffect } from 'react'

interface ElectionCountdownProps {
  electionDate: string // ISO date string like "2026-11-03"
}

export function ElectionCountdown({ electionDate }: ElectionCountdownProps) {
  const [now, setNow] = useState(() => new Date())

  const target = new Date(electionDate + 'T00:00:00')
  const diff = target.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const isUnder24h = diff > 0 && days < 1

  useEffect(() => {
    // Update every second if < 24 hours, otherwise every minute
    const interval = isUnder24h ? 1_000 : 60_000
    const timer = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(timer)
  }, [isUnder24h])

  // Election day (same calendar day)
  const nowDate = now.toISOString().split('T')[0]
  const targetDate = electionDate
  if (nowDate === targetDate) {
    return (
      <div className="flex items-center gap-2 text-[14px] font-medium text-green-400">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
        Election Day!
      </div>
    )
  }

  // Past election
  if (diff <= 0) {
    return (
      <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--poli-sub)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Results pending
      </div>
    )
  }

  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums text-[var(--poli-text)]">{days}</span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">
          {days === 1 ? 'day' : 'days'}
        </span>
      </div>
      <span className="text-[var(--poli-border)]">&middot;</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums text-[var(--poli-text)]">{hours}</span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">
          {hours === 1 ? 'hour' : 'hours'}
        </span>
      </div>
      {isUnder24h && (
        <>
          <span className="text-[var(--poli-border)]">&middot;</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-[var(--poli-text)]">{minutes}</span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">
              {minutes === 1 ? 'min' : 'mins'}
            </span>
          </div>
          <span className="text-[var(--poli-border)]">&middot;</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-[var(--poli-text)]">{seconds}</span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">
              sec
            </span>
          </div>
        </>
      )}
      <span className="ml-2 text-[12px] text-[var(--poli-faint)]">until Election Day</span>
    </div>
  )
}
