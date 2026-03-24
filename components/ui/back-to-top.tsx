'use client'

import { useEffect, useState } from 'react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="touch-feedback fixed bottom-[calc(72px+var(--safe-bottom)+12px)] right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--poli-border)] bg-[var(--poli-bg)]/90 text-[var(--poli-sub)] shadow-lg backdrop-blur-sm transition-all hover:border-[var(--poli-input-focus)] hover:text-[var(--poli-text)] sm:bottom-8 sm:right-8"
      aria-label="Back to top"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  )
}
