'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  {
    href: '/',
    label: 'Home',
    match: ['/'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/directory',
    label: 'Directory',
    match: ['/directory', '/politicians'],
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
]

interface MoreLink {
  href: string
  label: string
  authOnly?: boolean
}

const MORE_LINKS: MoreLink[] = [
  { href: '/insights', label: 'Insights' },
  { href: '/insights/money-map', label: 'Money Map' },
  { href: '/polls', label: 'Polls' },
  { href: '/report-cards', label: 'Civic Profiles' },
  { href: '/bills', label: 'Bills' },
  { href: '/issues/map', label: 'Issue Map' },
]

const AUTH_MORE_LINKS: MoreLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/quiz', label: 'Who Represents You' },
  { href: '/following', label: 'Following' },
  { href: '/account', label: 'Account' },
]

export function BottomTabs() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
    })
  }, [])

  const toggleMore = useCallback(() => {
    setMoreOpen((prev) => !prev)
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

      {/* More drawer sheet */}
      {moreOpen && (
        <div
          className="fixed left-0 right-0 z-50 rounded-t-xl border-t sm:hidden"
          style={{
            bottom: 'calc(56px + var(--safe-bottom, 0px))',
            backgroundColor: 'var(--poli-bg)',
            borderColor: 'var(--poli-border)',
            padding: '12px 16px',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          <div className="flex flex-col">
            {/* Public links */}
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMore}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
              >
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-1 border-t border-[var(--poli-border)]" />

            {/* Auth-dependent links */}
            {isLoggedIn ? (
              <>
                {AUTH_MORE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMore}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-[var(--poli-hover)]"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMore}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
        style={{
          backgroundColor: 'var(--poli-bg)',
          borderTop: '1px solid var(--poli-border)',
          paddingBottom: 'var(--safe-bottom, 0px)',
        }}
        aria-label="Mobile navigation"
      >
        <div style={{ display: 'flex', height: '56px', alignItems: 'stretch' }}>
          {TABS.map((tab) => {
            const isActive = !moreOpen && tab.match.some((m) =>
              m === '/' ? pathname === '/' : pathname.startsWith(m)
            )

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={closeMore}
                aria-current={isActive ? 'page' : undefined}
                className="no-underline"
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  color: isActive ? 'var(--poli-text)' : 'var(--poli-faint)',
                }}
              >
                {tab.icon}
                <span className="text-xs font-medium">{tab.label}</span>
                {/* Active dot indicator */}
                {isActive && (
                  <span
                    className="rounded-full bg-[var(--poli-text)]"
                    style={{ width: '4px', height: '4px', marginTop: '-1px' }}
                  />
                )}
              </Link>
            )
          })}

          {/* More button */}
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
              color: moreOpen ? 'var(--poli-text)' : 'var(--poli-faint)',
              WebkitAppearance: 'none',
            }}
            aria-label="More navigation options"
            aria-expanded={moreOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
            <span className="text-xs font-medium">More</span>
            {moreOpen && (
              <span
                className="rounded-full bg-[var(--poli-text)]"
                style={{ width: '4px', height: '4px', marginTop: '-1px' }}
              />
            )}
          </button>
        </div>
      </nav>
    </>
  )
}
