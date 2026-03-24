'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DonkeyIcon, ElephantIcon } from '@/components/icons/party-icons'

const NAV_LINKS = [
  { href: '/', label: 'Directory' },
  { href: '/compare', label: 'Compare' },
  { href: '/bills', label: 'Bills' },
  { href: '/elections', label: 'Elections' },
  { href: '/issues', label: 'Issues' },
  { href: '/insights', label: 'Insights' },
  { href: '/community', label: 'Community' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="sm:hidden">
      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--poli-border)] text-[var(--poli-sub)] transition-colors hover:text-[var(--poli-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Overlay + Menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[var(--poli-overlay)]"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed inset-x-0 top-0 z-50 bg-[var(--poli-bg)] px-6 pb-8 pt-6 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-1 no-underline" onClick={() => setOpen(false)}>
                <DonkeyIcon size={18} color="var(--poli-text)" />
                <ElephantIcon size={18} color="var(--poli-text)" className="scale-x-[-1]" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--poli-sub)]"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-4 py-3 text-[15px] font-medium no-underline transition-colors ${
                      isActive
                        ? 'bg-[var(--poli-hover)] text-[var(--poli-text)]'
                        : 'text-[var(--poli-sub)] hover:text-[var(--poli-text)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
