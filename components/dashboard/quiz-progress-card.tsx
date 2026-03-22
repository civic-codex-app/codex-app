'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadQuizAnswers } from '@/lib/utils/quiz-storage'

export function QuizProgressCard() {
  const [progress, setProgress] = useState<{ answered: number; total: number } | null>(null)

  useEffect(() => {
    const answers = loadQuizAnswers()
    const count = Object.keys(answers).length
    if (count > 0 && count < 14) {
      setProgress({ answered: count, total: 14 })
    }
  }, [])

  return (
    <Link
      href="/quiz"
      className="group relative rounded-lg border border-[var(--codex-border)] p-5 no-underline transition-all hover:border-[var(--codex-text)] hover:shadow-md"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <div className="text-[15px] font-bold text-[var(--codex-text)]">Who Represents You?</div>
      <p className="mt-1 text-[12px] text-[var(--codex-faint)]">
        {progress
          ? `Continue — ${progress.answered} of ${progress.total} answered`
          : 'Find politicians who align with your views'}
      </p>

      {/* Progress bar indicator */}
      {progress && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--codex-border)]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(progress.answered / progress.total) * 100}%`,
                background: 'linear-gradient(90deg, #22C55E, #16A34A)',
              }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
