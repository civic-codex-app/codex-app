import { SkeletonBlock, SkeletonText, SkeletonScreen } from '@/components/ui/skeleton'

/**
 * Placeholder for /elections.
 *
 * Content region only — app/(public)/layout.tsx owns the header, footer and
 * bottom tabs, so rendering them here would double them during a navigation.
 *
 * Dimensions are copied from page.tsx rather than approximated: the same
 * mx-auto max-w-[1200px] px-6 pt-6 md:px-10 container, the same grid
 * definitions and gaps, and the map sized by the real SVG's viewBox aspect
 * ratio (868.04 x 531.13 in lib/data/us-state-paths.ts) so the state grid
 * below it does not jump when the map arrives.
 */
export default function ElectionsLoading() {
  return (
    <SkeletonScreen label="Loading elections">
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* Voter registration banner — real one is px-5 py-4 with a 24px icon */}
        <div className="mb-8 flex items-center gap-4 rounded-xl bg-[var(--poli-badge-bg)] px-5 py-4">
          <SkeletonBlock className="h-6 w-6 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonText w="w-52" h="h-4" />
            <SkeletonText w="w-40" h="h-[14px]" />
          </div>
          <SkeletonBlock className="h-4 w-4 shrink-0 rounded" />
        </div>

        {/* Hero: h1 at clamp(28px,4vw,44px)/1.1, a two-line 15px paragraph, countdown */}
        <div className="mb-8">
          <SkeletonBlock
            className="mb-3 w-[240px] max-w-full md:w-[320px]"
            style={{ height: 'calc(clamp(28px, 4vw, 44px) * 1.1)' }}
          />
          <div className="mb-4 max-w-lg space-y-[9px]">
            <SkeletonText w="w-full" h="h-5" />
            <SkeletonText w="w-2/3" h="h-5" />
          </div>
          {/* Countdown is text-3xl (36px line box) with 11px unit labels */}
          <div className="flex h-9 items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <SkeletonBlock className="h-7 w-12" />
              <SkeletonBlock className="h-3 w-9" />
            </div>
            <SkeletonBlock className="h-3 w-1 rounded-full" />
            <div className="flex items-baseline gap-1.5">
              <SkeletonBlock className="h-7 w-10" />
              <SkeletonBlock className="h-3 w-10" />
            </div>
            <SkeletonBlock className="ml-2 h-3 w-28" />
          </div>
        </div>

        {/* Quick stats — 4 cards, 2-up until sm */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[var(--poli-border)] p-4 text-center">
              <div className="flex h-8 items-center justify-center">
                <SkeletonBlock className="h-6 w-12" />
              </div>
              <div className="flex h-[18px] items-center justify-center">
                <SkeletonBlock className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive map */}
        <div className="mb-10">
          <div className="mb-2 flex h-[18px] items-center justify-center">
            <SkeletonBlock className="h-3 w-40" />
          </div>
          <SkeletonBlock
            className="w-full rounded-xl"
            style={{ aspectRatio: '868.04 / 531.13' }}
          />
          {/* "Tap a state to see details" — an 11px hint the map draws under
              itself, mt-2, and only on touch widths: the real one is sm:hidden.
              Leaving it out made this block 23px short on mobile; drawing it at
              every width made it 25px too tall on tablet. Both moved the state
              list and everything under it. */}
          <div className="mt-2 flex h-[16.5px] items-center justify-center sm:hidden">
            <SkeletonBlock className="h-2.5 w-36" />
          </div>
          {/* Legend is text-[11px], so a 16.5px line box, not 18. */}
          <div className="mt-2 flex h-[16.5px] items-center justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <SkeletonBlock className="h-3 w-3 rounded-sm" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* "Or Browse by State" — text-sm, 20px line box */}
        <div className="mb-4 flex h-5 items-center">
          <SkeletonBlock className="h-4 w-36" />
        </div>

        {/* State tiles. Real page renders 52; ten is roughly what clears the
            fold once the map is above it, and a 52-tile skeleton is itself a
            rendering cost. */}
        <div className="mb-12 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[var(--poli-border)] p-3">
              <div className="mb-1 flex h-[21px] items-center gap-2">
                <SkeletonBlock className="h-3 w-5 rounded" />
                <SkeletonBlock className="h-[15px] w-20" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <SkeletonBlock className="h-5 w-14 rounded" />
                <SkeletonBlock className="h-5 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  )
}
