'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
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

// Desktop nav items
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/following', label: 'Following' },
  { href: '/account', label: 'Account' },
]

// Mobile bottom tabs for account section
const ACCOUNT_TABS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/following',
    label: 'Following',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/account',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useTheme()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)

  const closeMore = useCallback(() => setMoreOpen(false), [])

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
      {/* Desktop top nav */}
      <nav className="sticky top-0 z-40 border-b border-[var(--codex-border)] bg-[var(--codex-bg)]" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="fixed left-0 right-0 top-0 -z-10 bg-[var(--codex-bg)]" style={{ height: 'env(safe-area-inset-top, 0px)' }} />
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3 md:px-10 md:py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1 no-underline" aria-label="Home">
              <ElephantIcon size={20} color="#DC2626" />
              <DonkeyIcon size={20} color="#2563EB" />
            </Link>
            <div className="hidden gap-1 sm:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-[12px] uppercase tracking-[0.08em] no-underline transition-colors',
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
                      <span className="font-serif text-xs text-[var(--codex-sub)]">{userInitial}</span>
                    </div>
                  )}
                </div>
              </Link>
            )}
            <ThemeToggle />
            <form action="/api/auth/signout" method="POST" className="hidden sm:block">
              <button type="submit" className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1200px] px-6 py-8 md:px-10 md:py-10">{children}</main>

      {/* Mobile bottom tabs — account-focused */}
      {moreOpen && (
        <div className="fixed inset-0 z-30 sm:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={closeMore} />
      )}
      {moreOpen && (
        <div
          className="fixed left-0 right-0 z-50 border-t sm:hidden"
          style={{ bottom: 'calc(56px + var(--safe-bottom, 0px))', backgroundColor: 'var(--codex-bg)', borderColor: 'var(--codex-border)', padding: '16px 24px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link href="/" onClick={closeMore} style={{ display: 'block', padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--codex-text)', textDecoration: 'none', borderRadius: '8px' }}>
              Directory
            </Link>
            <Link href="/elections" onClick={closeMore} style={{ display: 'block', padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--codex-text)', textDecoration: 'none', borderRadius: '8px' }}>
              Elections
            </Link>
            <Link href="/issues" onClick={closeMore} style={{ display: 'block', padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--codex-text)', textDecoration: 'none', borderRadius: '8px' }}>
              Issues
            </Link>
            <Link href="/insights" onClick={closeMore} style={{ display: 'block', padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--codex-text)', textDecoration: 'none', borderRadius: '8px' }}>
              Insights
            </Link>
            <div style={{ borderTop: '1px solid var(--codex-border)', marginTop: '4px', paddingTop: '4px' }}>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#EF4444', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
        style={{ backgroundColor: 'var(--codex-bg)', borderTop: '1px solid var(--codex-border)', paddingBottom: 'var(--safe-bottom, 0px)' }}
      >
        <div style={{ display: 'flex', height: '56px', alignItems: 'stretch' }}>
          {ACCOUNT_TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={closeMore}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textDecoration: 'none', color: isActive ? 'var(--codex-text)' : 'var(--codex-faint)' }}
              >
                {tab.icon}
                <span style={{ fontSize: '10px', fontWeight: 500 }}>{tab.label}</span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((prev) => !prev)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: moreOpen ? 'var(--codex-text)' : 'var(--codex-faint)', WebkitAppearance: 'none' as any }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
