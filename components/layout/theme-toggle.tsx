'use client'

import { useTheme } from '@/lib/hooks/use-theme'

export function ThemeToggle() {
  const { mode, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      className="flex items-center gap-2 rounded-full border border-[var(--codex-border)] bg-[var(--codex-badge-bg)] px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--codex-sub)] transition-all hover:border-[var(--codex-input-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]"
    >
      <span className="text-sm">{mode === 'dark' ? '☀' : '☾'}</span>
      {mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
