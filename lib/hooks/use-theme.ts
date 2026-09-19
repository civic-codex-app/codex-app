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
    // Light is the product default. Only an explicit choice — the theme
    // toggle, which is the sole writer of poli-theme — makes the app dark.
    //
    // This deliberately does NOT read prefers-color-scheme. It used to, and
    // together with the same fallback in the pre-paint script in
    // app/layout.tsx that meant every visitor whose phone was in dark mode got
    // a dark app on first load, with nothing stored and no way to tell it was
    // a default rather than the design. The system-preference listener that
    // sat here went with it: with no OS fallback there is nothing for it to
    // switch, and leaving it would have let the OS quietly override the
    // default it no longer feeds.
    //
    // Keep this in step with the inline script in app/layout.tsx. That one
    // decides the first painted frame and this one decides the store; if they
    // disagree the page visibly changes colour just after it loads.
    const saved = localStorage.getItem('poli-theme') as 'dark' | 'light' | null
    setMode(saved === 'dark' ? 'dark' : 'light')
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
