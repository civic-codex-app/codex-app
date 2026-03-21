'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const TABS = [
  {
    href: '/',
    label: 'Directory',
    match: ['/'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/elections',
    label: 'Elections',
    match: ['/elections'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    href: '/issues',
    label: 'Issues',
    match: ['/issues'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    href: '/insights',
    label: 'Insights',
    match: ['/insights'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: '#more',
    label: 'More',
    match: [],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    ),
  },
]

const MORE_LINKS = [
  { href: '/compare', label: 'Compare' },
  { href: '/bills', label: 'Bills' },
  { href: '/polls', label: 'Polls' },
]

export function BottomTabs() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      {/* More panel overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More panel */}
      {moreOpen && (
        <div
          className="fixed bottom-[calc(56px+var(--safe-bottom))] left-0 right-0 z-50 border-t border-[var(--codex-border)] bg-[var(--codex-bg)] px-6 py-4 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMoreOpen(false)}
                className="touch-feedback rounded-lg px-4 py-3 text-[14px] font-medium text-[var(--codex-text)] no-underline transition-colors hover:bg-[var(--codex-hover)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--codex-border)] bg-[var(--codex-bg)]/95 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
        aria-label="Mobile navigation"
      >
        <div className="flex h-14 items-stretch">
          {TABS.map((tab) => {
            const isMore = tab.href === '#more'
            const isActive = isMore
              ? moreOpen
              : tab.match.some((m) =>
                  m === '/' ? pathname === '/' : pathname.startsWith(m)
                )

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="touch-feedback flex flex-1 flex-col items-center justify-center gap-0.5 no-underline"
                >
                  <span style={{ color: isActive ? 'var(--codex-text)' : 'var(--codex-faint)' }}>
                    {tab.icon}
                  </span>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: isActive ? 'var(--codex-text)' : 'var(--codex-faint)' }}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMoreOpen(false)}
                className="touch-feedback flex flex-1 flex-col items-center justify-center gap-0.5 no-underline"
              >
                <span style={{ color: isActive ? 'var(--codex-text)' : 'var(--codex-faint)' }}>
                  {tab.icon}
                </span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? 'var(--codex-text)' : 'var(--codex-faint)' }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
