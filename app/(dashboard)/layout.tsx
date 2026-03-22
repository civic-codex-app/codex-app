'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/lib/hooks/use-theme'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { DonkeyIcon, ElephantIcon } from '@/components/icons/party-icons'
import { cn } from '@/lib/utils'

interface UserProfile {
  display_name: string | null
  avatar_url: string | null
  email: string | null
}

// Secondary nav items for desktop
const SECONDARY_NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/following', label: 'Following' },
  { href: '/account', label: 'Account' },
]

// Account-specific bottom tabs for mobile
const ACCOUNT_TABS = [
  {
    href: '/dashboard',
    label: 'Home',
    match: ['/dashboard'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/following',
    label: 'Following',
    match: ['/following'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/account',
    label: 'Account',
    match: ['/account'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const MORE_LINKS = [
  { href: '/ballot', label: 'My Ballot' },
  { href: '/directory', label: 'Directory' },
  { href: '/elections', label: 'Elections' },
  { href: '/issues', label: 'Issues' },
  { href: '/insights', label: 'Insights' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useTheme()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)

  const toggleMore = useCallback(() => {
    setMoreOpen((prev) => !prev)
  }, [])

  const closeMore = useCallback(() => {
    setMoreOpen(false)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, email')
        .eq('id', user.id)
        .single()
      if (data) setProfile(data)
    }
    loadProfile()
  }, [pathname])

  const userInitial = (profile?.display_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[var(--codex-bg)] pb-16 sm:pb-0">
      {/* Desktop top nav — logo + avatar + sign out */}
      <nav
        className="sticky z-40 border-b border-[var(--codex-border)] bg-[var(--codex-bg)]"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div
          className="fixed left-0 right-0 top-0 -z-10 bg-[var(--codex-bg)]"
          style={{ height: 'env(safe-area-inset-top, 0px)' }}
        />
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3 md:px-10 md:py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1 no-underline" aria-label="Home">
              <ElephantIcon size={20} color="#DC2626" />
              <DonkeyIcon size={20} color="#2563EB" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <Link href="/account" className="no-underline">
                <div className="h-7 w-7 overflow-hidden rounded-full border border-[var(--codex-border)] transition-colors hover:border-[var(--codex-text)]">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name ?? 'Avatar'}
                      width={28}
                      height={28}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--codex-badge-bg)]">
                      <span className="text-xs font-semibold text-[var(--codex-sub)]">{userInitial}</span>
                    </div>
                  )}
                </div>
              </Link>
            )}
            <ThemeToggle />
            <form action="/api/auth/signout" method="POST" className="hidden sm:block">
              <button
                type="submit"
                className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Secondary nav — desktop only, pill-style tabs */}
      <div className="hidden border-b border-[var(--codex-border)] bg-[var(--codex-bg)] sm:block">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-6 py-2 md:px-10">
          {SECONDARY_NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium no-underline transition-colors',
                  isActive
                    ? 'bg-[var(--codex-badge-bg)] text-[var(--codex-text)]'
                    : 'text-[var(--codex-sub)] hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] px-6 py-8 md:px-10 md:py-10">{children}</main>

      {/* Mobile: Account-specific bottom tab bar */}

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
            backgroundColor: 'var(--codex-bg)',
            borderColor: 'var(--codex-border)',
            padding: '12px 16px',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          <div className="flex flex-col">
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMore}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--codex-text)] no-underline transition-colors hover:bg-[var(--codex-hover)]"
              >
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-1 border-t border-[var(--codex-border)]" />

            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-[var(--codex-hover)]"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
        style={{
          backgroundColor: 'var(--codex-bg)',
          borderTop: '1px solid var(--codex-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        aria-label="Account navigation"
      >
        <div style={{ display: 'flex', height: '56px', alignItems: 'stretch' }}>
          {ACCOUNT_TABS.map((tab) => {
            const isActive = !moreOpen && tab.match.some((m) => pathname.startsWith(m))

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
                  color: isActive ? 'var(--codex-text)' : 'var(--codex-faint)',
                }}
              >
                {tab.icon}
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <span
                    className="rounded-full bg-[var(--codex-text)]"
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
              color: moreOpen ? 'var(--codex-text)' : 'var(--codex-faint)',
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
                className="rounded-full bg-[var(--codex-text)]"
                style={{ width: '4px', height: '4px', marginTop: '-1px' }}
              />
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}
