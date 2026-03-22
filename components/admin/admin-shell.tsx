'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/hooks/use-theme'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/politicians', label: 'Politicians' },
  { href: '/admin/elections', label: 'Elections' },
  { href: '/admin/polls', label: 'Polls' },
  { href: '/admin/bills', label: 'Bills' },
  { href: '/admin/issues', label: 'Issues' },
  { href: '/admin/voting-records', label: 'Voting Records' },
  { href: '/admin/finance', label: 'Campaign Finance' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/annotations', label: 'Annotations' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  useTheme()
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen bg-[var(--codex-bg)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-full w-56 flex-col border-r border-[var(--codex-border)] bg-[var(--codex-card)]">
        <div className="flex items-center gap-3 border-b border-[var(--codex-border)] px-5 py-5">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-[26px] w-[26px] items-center justify-center border border-[var(--codex-text)] text-[13px] font-semibold text-[var(--codex-text)]">
              C
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Admin
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'mb-0.5 block rounded-md px-3 py-2 text-[13px] no-underline transition-colors',
                isActive(item.href)
                  ? 'bg-[var(--codex-badge-bg)] font-medium text-[var(--codex-text)]'
                  : 'text-[var(--codex-sub)] hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[var(--codex-border)] px-5 py-4">
          <Link href="/dashboard" className="text-[11px] text-[var(--codex-faint)] hover:text-[var(--codex-text)]">
            &larr; Back to app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 px-8 py-8">{children}</main>
    </div>
  )
}
