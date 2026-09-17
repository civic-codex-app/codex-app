'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/hooks/use-theme'
import { cn } from '@/lib/utils'

// Every entry must have a page under app/admin. Two used to point at
// /admin/voting-records and /admin/finance, which never existed — a 404 in
// the sidebar of every admin screen — while /admin/polls and /admin/inbox
// existed and were reachable only by typing the URL.
const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/politicians', label: 'Politicians' },
  { href: '/admin/elections', label: 'Elections' },
  { href: '/admin/daily-topics', label: 'Daily Topics' },
  { href: '/admin/bills', label: 'Bills' },
  { href: '/admin/issues', label: 'Issues' },
  { href: '/admin/polls', label: 'Polls' },
  { href: '/admin/inbox', label: 'Inbox' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/annotations', label: 'Annotations' },
  { href: '/admin/settings', label: 'Settings' },
]

/**
 * The sidebar is fixed at 224px and appears at lg (1024px). Below that the
 * same links sit in a scrollable strip under a compact top bar. The shell
 * used to render the fixed sidebar and a 224px left margin at every width,
 * which left a phone 87px for content: every admin screen scrolled sideways
 * at 375px and the list pages did at 768px too.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  useTheme()
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const brand = (
    <Link href="/" className="flex items-center gap-3 no-underline">
      <div className="flex h-[26px] w-[26px] items-center justify-center border border-[var(--poli-text)] text-[13px] font-semibold text-[var(--poli-text)]">
        C
      </div>
      <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
        Admin
      </span>
    </Link>
  )

  return (
    <div className="min-h-screen bg-[var(--poli-bg)]">
      {/* Top bar + link strip, below lg */}
      <header className="sticky top-0 z-40 border-b border-[var(--poli-border)] bg-[var(--poli-card)] lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {brand}
          <Link href="/dashboard" className="text-[11px] text-[var(--poli-faint)] no-underline hover:text-[var(--poli-text)]">
            &larr; Back to app
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] no-underline transition-colors',
                isActive(item.href)
                  ? 'bg-[var(--poli-badge-bg)] font-medium text-[var(--poli-text)]'
                  : 'text-[var(--poli-sub)] hover:bg-[var(--poli-hover)] hover:text-[var(--poli-text)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Sidebar, lg and up */}
      <aside className="fixed left-0 top-0 hidden h-full w-56 flex-col border-r border-[var(--poli-border)] bg-[var(--poli-card)] lg:flex">
        <div className="border-b border-[var(--poli-border)] px-5 py-5">{brand}</div>
        <nav className="flex-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'mb-0.5 block rounded-md px-3 py-2 text-[13px] no-underline transition-colors',
                isActive(item.href)
                  ? 'bg-[var(--poli-badge-bg)] font-medium text-[var(--poli-text)]'
                  : 'text-[var(--poli-sub)] hover:bg-[var(--poli-hover)] hover:text-[var(--poli-text)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[var(--poli-border)] px-5 py-4">
          <Link href="/dashboard" className="text-[11px] text-[var(--poli-faint)] hover:text-[var(--poli-text)]">
            &larr; Back to app
          </Link>
        </div>
      </aside>

      {/* min-w-0: a table or long heading inside must not widen the page. */}
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:ml-56 lg:px-8 lg:py-8">{children}</main>
    </div>
  )
}
