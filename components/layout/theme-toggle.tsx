'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/lib/hooks/use-theme'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { mode, toggle, setMode } = useThemeStore()

  useEffect(() => {
    const saved = localStorage.getItem('codex-theme') as 'dark' | 'light' | null
    if (saved) {
      setMode(saved)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    }
    setMounted(true)
  }, [setMode])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.toggle('dark', mode === 'dark')
    root.classList.toggle('light', mode !== 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#050505' : '#FAFAF8')
  }, [mode, mounted])

  if (!mounted) {
    return <div style={{ width: '80px', height: '32px' }} />
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        border: '1px solid var(--codex-border)',
        backgroundColor: 'var(--codex-badge-bg)',
        padding: '6px 14px',
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--codex-sub)',
        cursor: 'pointer',
        WebkitAppearance: 'none',
      }}
    >
      {mode === 'dark' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
