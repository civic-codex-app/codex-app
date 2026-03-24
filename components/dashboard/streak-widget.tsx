'use client'

import { useEffect, useRef, useState } from 'react'
import { FlameIcon } from '@/components/icons/badge-icons'

interface StreakWidgetProps {
  initialStreak: number
  longestStreak: number
}

export function StreakWidget({ initialStreak, longestStreak }: StreakWidgetProps) {
  const [streak, setStreak] = useState(initialStreak)
  const [best, setBest] = useState(longestStreak)
  const [displayNumber, setDisplayNumber] = useState(0)
  const hasLoggedRef = useRef(false)

  // Log a login engagement event once per session
  useEffect(() => {
    if (hasLoggedRef.current) return
    hasLoggedRef.current = true

    const sessionKey = 'poli-engagement-logged'
    if (sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, '1')

    fetch('/api/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'login' }),
    })
      .then((res) => {
        if (res.ok) return res.json()
        return null
      })
      .then((data) => {
        if (data) {
          setStreak(data.streak)
          setBest(data.longestStreak)
        }
      })
      .catch(() => {
        // Silently fail — engagement logging is non-critical
      })
  }, [])

  // Animate the streak number counting up
  useEffect(() => {
    if (streak === 0) {
      setDisplayNumber(0)
      return
    }

    const duration = 600 // ms
    const steps = Math.min(streak, 30)
    const stepDuration = duration / steps
    let current = 0

    const interval = setInterval(() => {
      current += 1
      setDisplayNumber(Math.min(current, streak))
      if (current >= streak) {
        clearInterval(interval)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [streak])

  return (
    <div className="rounded-lg border border-[var(--poli-border)] p-5 transition-all hover:border-[var(--poli-text)] hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{
            background: streak > 0
              ? 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(239,68,68,0.15))'
              : 'var(--poli-hover)',
          }}
        >
          <FlameIcon size={24} className={streak > 0 ? 'text-orange-400' : 'text-[var(--poli-faint)]'} />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-3xl font-bold tabular-nums text-[var(--poli-text)]"
              style={{
                transition: 'transform 0.2s ease',
                display: 'inline-block',
              }}
            >
              {displayNumber}
            </span>
            <span className="text-[13px] font-medium text-[var(--poli-sub)]">
              day streak
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-[var(--poli-faint)]">
            {best > 0 ? `Best: ${best} days` : 'Start your streak today'}
          </p>
        </div>
      </div>

      {/* Streak milestone markers */}
      {streak > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1">
            {[7, 14, 21, 30].map((milestone) => (
              <div key={milestone} className="flex-1">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    background:
                      streak >= milestone
                        ? 'linear-gradient(90deg, #F97316, #EF4444)'
                        : 'var(--poli-border)',
                    opacity: streak >= milestone ? 1 : 0.4,
                  }}
                />
                <p className="mt-1 text-center text-[10px] text-[var(--poli-faint)]">
                  {milestone}d
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
