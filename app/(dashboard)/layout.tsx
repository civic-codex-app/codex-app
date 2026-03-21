'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/hooks/use-theme'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/following', label: 'Following' },
  { href: '/account', label: 'Account' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useTheme()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[var(--codex-bg)]">
      {/* Top nav */}
      <nav className="border-b border-[var(--codex-border)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="flex h-[30px] w-[30px] items-center justify-center border border-[var(--codex-text)] font-serif text-[15px] text-[var(--codex-text)]">
                C
              </div>
            </Link>
            <div className="flex gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm no-underline transition-colors',
                    pathname === item.href
                      ? 'bg-[var(--codex-badge-bg)] font-medium text-[var(--codex-text)]'
                      : 'text-[var(--codex-sub)] hover:text-[var(--codex-text)]'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">{children}</main>
    </div>
  )
}
