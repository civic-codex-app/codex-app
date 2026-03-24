'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { clearQuizProgress } from '@/lib/utils/quiz-storage'

export function SignoutToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('signedout') === '1') {
      setShow(true)
      // Clear quiz data on logout
      clearQuizProgress()
      // Clean the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('signedout')
      router.replace(url.pathname, { scroll: false })
      // Auto-dismiss after 3s
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  if (!show) return null

  return (
    <div
      className="fixed top-20 left-1/2 z-50 -translate-x-1/2 animate-fade-up rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] px-5 py-3 shadow-lg"
    >
      <div className="flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--codex-sub)]">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <span className="text-[13px] font-medium text-[var(--codex-text)]">You&apos;ve been signed out</span>
      </div>
    </div>
  )
}
