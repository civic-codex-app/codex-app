'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DonkeyIcon, ElephantIcon } from '@/components/icons/party-icons'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const NAV_LINKS = [
  { href: '/', label: 'Directory' },
  { href: '/compare', label: 'Compare' },
  { href: '/match', label: 'Match' },
  { href: '/bills', label: 'Bills' },
  { href: '/elections', label: 'Elections' },
  { href: '/issues', label: 'Issues' },
  { href: '/polls', label: 'Polls' },
  { href: '/insights', label: 'Insights' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky z-40 mb-6 border-b border-[var(--codex-border)] bg-[var(--codex-bg)] sm:mb-8 md:mb-10" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      {/* Fixed background behind iOS status bar */}
      <div className="fixed left-0 right-0 top-0 -z-10 bg-[var(--codex-bg)]" style={{ height: 'env(safe-area-inset-top, 0px)' }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-[var(--codex-card)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--codex-text)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--codex-input-focus)]"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3 md:px-10 md:py-4">
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-1 no-underline" aria-label="Codex Home">
            <ElephantIcon size={22} color="#DC2626" />
            <DonkeyIcon size={22} color="#2563EB" />
          </Link>
          <nav className="ml-4 hidden items-center gap-4 sm:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[12px] uppercase tracking-[0.08em] no-underline transition-colors hover:text-[var(--codex-text)] ${
                    isActive ? 'text-[var(--codex-text)]' : 'text-[var(--codex-sub)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        {/* Theme toggle on mobile (replaces hamburger), hidden on desktop (footer has it) */}
        <div className="sm:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
