'use client'

import Link from 'next/link'
import { DonkeyIcon, ElephantIcon, GreenDiamond } from '@/components/icons/party-icons'
import { useThemeStore } from '@/lib/hooks/use-theme'

export function Footer({ hideDisclaimer = false }: { hideDisclaimer?: boolean } = {}) {
  const { mode, toggle } = useThemeStore()

  // The disclaimer is shown everywhere, including on /data-sources.
  //
  // That page used to pass hideDisclaimer when it rendered its own Footer,
  // because the disclaimer links to and summarises the page you are already
  // on. When the chrome moved to the layout I tried to preserve that with
  // `pathname === '/data-sources'`, which produced a hydration mismatch:
  // usePathname() in a client component does not resolve to the concrete
  // route while a page is being statically prerendered through a shared
  // layout, so the server emitted the disclaimer and the client removed it.
  //
  // A little redundancy on one page is a better trade than a per-route branch
  // in shared chrome. The prop is kept for any caller that renders a Footer
  // directly.
  const hide = hideDisclaimer

  return (
    <footer className="mt-10 border-t border-[var(--poli-border)] py-10 max-lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DonkeyIcon size={12} color="var(--poli-faint)" />
          <ElephantIcon size={12} color="var(--poli-faint)" />
          <GreenDiamond size={12} color="var(--poli-faint)" />
        </div>
        <div className="flex items-center gap-4">
          {!hide && (
            <>
              <Link href="/data-sources" className="text-[12px] text-[var(--poli-faint)] transition-colors hover:text-[var(--poli-sub)]">
                Data Sources
              </Link>
              <Link href="/contact" className="text-[12px] text-[var(--poli-faint)] transition-colors hover:text-[var(--poli-sub)]">
                Contact
              </Link>
              <Link href="/privacy" className="text-[12px] text-[var(--poli-faint)] transition-colors hover:text-[var(--poli-sub)]">
                Privacy
              </Link>
              <Link href="/terms" className="text-[12px] text-[var(--poli-faint)] transition-colors hover:text-[var(--poli-sub)]">
                Terms
              </Link>
            </>
          )}
          <button
            onClick={toggle}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--poli-faint)] transition-colors hover:text-[var(--poli-sub)]"
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mode === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {!hide && (
        <p className="mt-4 text-[11px] leading-relaxed text-[var(--poli-faint)]">
          Poli is currently in beta. We are an independent civic education platform, not affiliated with any political party, campaign, or government agency.
          All data is compiled from public sources and may contain errors.{' '}
          <Link href="/data-sources" className="underline hover:text-[var(--poli-sub)]">
            View our full data sources and disclaimer.
          </Link>
        </p>
      )}
    </footer>
  )
}
