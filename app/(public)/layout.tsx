import { BottomTabs } from '@/components/layout/bottom-tabs'
import { BackToTop } from '@/components/ui/back-to-top'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
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
      <main id="main-content" className="pb-[72px] sm:pb-0" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        {/* Data freshness disclaimer */}
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="mb-0 mt-2 rounded-lg border border-amber-500/15 bg-amber-500/5 px-4 py-2 text-[11px] text-[var(--codex-faint)] sm:mt-0">
            <span className="mr-1 font-medium text-amber-600/80">Beta</span>
            Data is sourced from public records and may not reflect the most recent changes in office.
            <span className="hidden sm:inline"> Officials, stances, and election data are updated periodically. Some positions may be estimated based on party affiliation.</span>
          </div>
        </div>
        {children}
      </main>
      <BackToTop />
      <BottomTabs />
    </div>
  )
}
