'use client'

import Link from 'next/link'
import { useTheme } from '@/lib/hooks/use-theme'
import { DonkeyIcon, ElephantIcon } from '@/components/icons/party-icons'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useTheme()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--codex-bg)] px-6">
      <Link href="/" className="mb-10 flex items-center gap-2 no-underline">
        <ElephantIcon size={24} color="#DC2626" />
        <DonkeyIcon size={24} color="#2563EB" />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
