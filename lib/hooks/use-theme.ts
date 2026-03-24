'use client'

import { create } from 'zustand'
import { useEffect } from 'react'

interface ThemeStore {
  mode: 'dark' | 'light'
  toggle: () => void
  setMode: (mode: 'dark' | 'light') => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'light',
  toggle: () =>
    set((state) => {
      const next = state.mode === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        localStorage.setItem('poli-theme', next)
      }
      return { mode: next }
    }),
  setMode: (mode) => set({ mode }),
}))

export function useTheme() {
  const { mode, toggle, setMode } = useThemeStore()

  useEffect(() => {
    // Check saved preference first, then fall back to system preference
    const saved = localStorage.getItem('poli-theme') as 'dark' | 'light' | null
    if (saved) {
      setMode(saved)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    }

    // Listen for system preference changes (only if no manual override)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('poli-theme')) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setMode])

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    // Update theme-color meta for browser chrome
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#050505' : '#FAFAF8')
  }, [mode])

  return { mode, toggle }
}
