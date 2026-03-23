'use client'

import Link from 'next/link'
import { DonkeyIcon, ElephantIcon, GreenDiamond } from '@/components/icons/party-icons'
import { useThemeStore } from '@/lib/hooks/use-theme'

export function Footer({ hideDisclaimer = false }: { hideDisclaimer?: boolean } = {}) {
  const { mode, toggle } = useThemeStore()

  return (
    <footer className="mt-10 border-t border-[var(--codex-border)] py-10 max-sm:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DonkeyIcon size={12} color="var(--codex-faint)" />
          <ElephantIcon size={12} color="var(--codex-faint)" />
          <GreenDiamond size={12} color="var(--codex-faint)" />
        </div>
        <div className="flex items-center gap-4">
          {!hideDisclaimer && (
            <Link
              href="/data-sources"
              className="text-[12px] text-[var(--codex-faint)] transition-colors hover:text-[var(--codex-sub)]"
            >
              Data Sources & Disclaimer
            </Link>
          )}
          <span className="hidden text-[13px] text-[var(--codex-faint)] sm:inline">
            Built for civic transparency
          </span>
          <button
            onClick={toggle}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--codex-faint)] transition-colors hover:text-[var(--codex-sub)]"
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
      {!hideDisclaimer && (
        <p className="mt-4 text-[11px] leading-relaxed text-[var(--codex-faint)]">
          Poli is currently in beta. We are an independent civic education platform, not affiliated with any political party, campaign, or government agency.
          All data is compiled from public sources and may contain errors.{' '}
          <Link href="/data-sources" className="underline hover:text-[var(--codex-sub)]">
            View our full data sources and disclaimer.
          </Link>
        </p>
      )}
    </footer>
  )
}
