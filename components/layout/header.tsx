'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { DonkeyIcon, ElephantIcon } from '@/components/icons/party-icons'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  display_name: string | null
  avatar_url: string | null
  email: string | null
}

interface DropdownItem {
  href: string
  label: string
}

interface NavItem {
  href: string
  label: string
  dropdown?: DropdownItem[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  {
    href: '/directory',
    label: 'Directory',
    dropdown: [
      { href: '/directory', label: 'Browse All' },
      { href: '/compare', label: 'Compare' },
      { href: '/report-cards', label: 'Civic Profiles' },
    ],
  },
  { href: '/elections', label: 'Elections' },
  {
    href: '/issues',
    label: 'Issues',
    dropdown: [
      { href: '/issues', label: 'All Issues' },
      { href: '/issues/map', label: 'Issue Map' },
      { href: '/bills', label: 'Bills' },
    ],
  },
  {
    href: '/insights',
    label: 'Insights',
    dropdown: [
      { href: '/insights', label: 'Overview' },
      { href: '/insights/money-map', label: 'Money Map' },
      { href: '/polls', label: 'Polls' },
    ],
  },
]

const USER_MENU_ITEMS: DropdownItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/match', label: 'Voter Match' },
  { href: '/following', label: 'Following' },
  { href: '/account', label: 'Account' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setIsLoggedIn(!!data.user)
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, email')
          .eq('id', data.user.id)
          .single()
        if (profileData) setProfile(profileData)
      }
    })
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null)
    setUserMenuOpen(false)
  }, [pathname])

  const toggleDropdown = useCallback((label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label))
  }, [])

  const isNavActive = (item: NavItem) => {
    if (item.href === '/') return pathname === '/'
    return pathname === item.href || pathname.startsWith(item.href)
  }

  const userInitial = (profile?.display_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/auth/signout'
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <header
      className="sticky z-40 border-b border-[var(--codex-border)] bg-[var(--codex-bg)]"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Fixed background behind iOS status bar */}
      <div
        className="fixed left-0 right-0 top-0 -z-10 bg-[var(--codex-bg)]"
        style={{ height: 'env(safe-area-inset-top, 0px)' }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-[var(--codex-card)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--codex-text)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--codex-input-focus)]"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3 md:px-10 md:py-4">
        {/* Left: Logo + Beta + Nav */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-1 no-underline" aria-label="Codex Home">
            <ElephantIcon size={22} color="#DC2626" />
            <DonkeyIcon size={22} color="#2563EB" />
          </Link>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Beta</span>

          <nav ref={navRef} className="ml-4 hidden items-center gap-1 sm:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item)
              const hasDropdown = !!item.dropdown
              const isOpen = openDropdown === item.label

              return (
                <div key={item.label} className="relative">
                  {hasDropdown ? (
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors hover:text-[var(--codex-text)] ${
                        active ? 'text-[var(--codex-text)] underline underline-offset-4 decoration-[var(--codex-text)]' : 'text-[var(--codex-sub)]'
                      }`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors hover:text-[var(--codex-text)] ${
                        active ? 'text-[var(--codex-text)] underline underline-offset-4 decoration-[var(--codex-text)]' : 'text-[var(--codex-sub)]'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Dropdown */}
                  {hasDropdown && isOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] py-1 shadow-lg">
                      {item.dropdown!.map((dropItem) => (
                        <Link
                          key={dropItem.href}
                          href={dropItem.href}
                          className={`block px-4 py-2 text-sm no-underline transition-colors hover:bg-[var(--codex-hover)] ${
                            pathname === dropItem.href ? 'font-medium text-[var(--codex-text)]' : 'text-[var(--codex-sub)]'
                          }`}
                        >
                          {dropItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Right: Search + User */}
        <div className="flex items-center gap-3">
          {/* Search icon link */}
          <Link
            href="/"
            className="hidden text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)] sm:block"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          {/* User avatar / Sign In */}
          {isLoggedIn ? (
            <div ref={userMenuRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="h-7 w-7 overflow-hidden rounded-full border border-[var(--codex-border)] transition-colors hover:border-[var(--codex-text)]">
                  {profile?.avatar_url ? (
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
              </button>

              {/* User dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] py-1 shadow-lg">
                  {USER_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2 text-sm no-underline transition-colors hover:bg-[var(--codex-hover)] ${
                        pathname === item.href ? 'font-medium text-[var(--codex-text)]' : 'text-[var(--codex-sub)]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-[var(--codex-border)] my-1" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-red-500 transition-colors hover:bg-[var(--codex-hover)]"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[var(--codex-sub)] no-underline transition-colors hover:text-[var(--codex-text)] sm:inline"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
