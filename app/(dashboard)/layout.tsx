'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/hooks/use-theme'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { DonkeyIcon, ElephantIcon } from '@/components/icons/party-icons'
import { BottomTabs } from '@/components/layout/bottom-tabs'
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useTheme()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)

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

      {/* Mobile: use the shared BottomTabs component */}
      <BottomTabs />
    </div>
  )
}
