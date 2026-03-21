'use client'

import { useTheme } from '@/lib/hooks/use-theme'
import { BottomTabs } from '@/components/layout/bottom-tabs'
import { BackToTop } from '@/components/ui/back-to-top'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Initialize theme on the public layout
  useTheme()

  return (
    <div className="relative min-h-screen transition-colors duration-400">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-400"
        style={{
          opacity: 'var(--codex-grid-opacity)',
          backgroundImage:
            'linear-gradient(var(--codex-border) 1px, transparent 1px), linear-gradient(90deg, var(--codex-border) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <main id="main-content" className="pb-[72px] sm:pb-0">
        {children}
      </main>
      <BackToTop />
      <BottomTabs />
    </div>
  )
}
