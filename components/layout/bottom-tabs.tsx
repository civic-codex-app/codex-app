'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

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
]

const MORE_LINKS = [
  { href: '/compare', label: 'Compare' },
  { href: '/bills', label: 'Bills' },
  { href: '/polls', label: 'Polls' },
]

export function BottomTabs() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const toggleMore = useCallback(() => {
    setMoreOpen(prev => !prev)
  }, [])

  const closeMore = useCallback(() => {
    setMoreOpen(false)
  }, [])

  return (
    <>
      {/* More panel overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-30 sm:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
          onClick={closeMore}
        />
      )}

      {/* More panel */}
      {moreOpen && (
        <div
          className="fixed left-0 right-0 z-50 border-t sm:hidden"
          style={{
            bottom: 'calc(56px + var(--safe-bottom, 0px))',
            backgroundColor: 'var(--codex-bg)',
            borderColor: 'var(--codex-border)',
            padding: '16px 24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMore}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--codex-text)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
        style={{
          backgroundColor: 'var(--codex-bg)',
          borderTop: '1px solid var(--codex-border)',
          paddingBottom: 'var(--safe-bottom, 0px)',
        }}
        aria-label="Mobile navigation"
      >
        <div style={{ display: 'flex', height: '56px', alignItems: 'stretch' }}>
          {TABS.map((tab) => {
            const isActive = tab.match.some((m) =>
              m === '/' ? pathname === '/' : pathname.startsWith(m)
            )

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={closeMore}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'var(--codex-text)' : 'var(--codex-faint)',
                }}
              >
                {tab.icon}
                <span style={{ fontSize: '10px', fontWeight: 500 }}>
                  {tab.label}
                </span>
              </Link>
            )
          })}

          {/* More button — separate from the map to use button element */}
          <button
            type="button"
            onClick={toggleMore}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              color: moreOpen ? 'var(--codex-text)' : 'var(--codex-faint)',
              WebkitAppearance: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
