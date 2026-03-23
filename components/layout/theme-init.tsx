'use client'

import { useTheme } from '@/lib/hooks/use-theme'

/** Initializes theme from localStorage / system preference. Renders nothing. */
export function ThemeInit() {
  useTheme()
  return null
}
