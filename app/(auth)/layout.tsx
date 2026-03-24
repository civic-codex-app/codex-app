'use client'

import Link from 'next/link'
import { useTheme } from '@/lib/hooks/use-theme'
import { DonkeyIcon, ElephantIcon } from '@/components/icons/party-icons'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useTheme()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--codex-bg)] px-6">
      <Link href="/" className="mb-8 flex items-center gap-2.5 no-underline">
        <ElephantIcon size={22} color="#DC2626" />
        <DonkeyIcon size={22} color="#2563EB" />
        <span className="text-[15px] font-bold tracking-tight text-[var(--codex-text)]">Poli</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <Link
        href="/"
        className="mt-8 text-[13px] text-[var(--codex-faint)] no-underline transition-colors hover:text-[var(--codex-text)]"
      >
        &larr; Back to home
      </Link>
    </div>
  )
}
