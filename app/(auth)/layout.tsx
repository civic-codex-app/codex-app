'use client'

import Link from 'next/link'
import { useTheme } from '@/lib/hooks/use-theme'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useTheme()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--codex-bg)] px-6">
      <Link href="/" className="mb-10 flex items-center gap-3 no-underline">
        <div className="flex h-[30px] w-[30px] items-center justify-center border border-[var(--codex-text)] font-serif text-[15px] text-[var(--codex-text)]">
          C
        </div>
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--codex-sub)]">
          Codex
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
