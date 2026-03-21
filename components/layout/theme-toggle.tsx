'use client'

import { useTheme } from '@/lib/hooks/use-theme'

export function ThemeToggle() {
  const { mode, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      onTouchEnd={(e) => { e.preventDefault(); toggle() }}
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
