'use client'

import { useEffect, useState } from 'react'
import { useThemeStore } from '@/lib/hooks/use-theme'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { mode, toggle, setMode } = useThemeStore()

  useEffect(() => {
    // Initialize theme from localStorage
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

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div style={{ width: '80px', height: '32px' }} />
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
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
      <span style={{ fontSize: '14px' }}>{mode === 'dark' ? '\u2600' : '\u263E'}</span>
      {mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
