'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/hooks/use-theme'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/following', label: 'Following' },
  { href: '/account', label: 'Account' },
]

interface UserProfile {
  display_name: string | null
  avatar_url: string | null
  email: string | null
}

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
  }, [pathname]) // Re-fetch when navigating (catches avatar updates)

  const userInitial = (profile?.display_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[var(--codex-bg)]">
      {/* Top nav */}
      <nav className="border-b border-[var(--codex-border)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="flex h-[30px] w-[30px] items-center justify-center border border-[var(--codex-text)] font-serif text-[15px] text-[var(--codex-text)]">
                C
              </div>
            </Link>
            <div className="flex gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm no-underline transition-colors',
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
          <div className="flex items-center gap-4">
            {/* User avatar */}
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
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">{children}</main>
    </div>
  )
}
