import { SkeletonBlock, SkeletonText, SkeletonScreen } from '@/components/ui/skeleton'

/**
 * Placeholder for /community, which is force-dynamic (it awaits the state and
 * page search params) and so always pays for a round trip to Supabase before
 * anything renders.
 *
 * Chrome is not repeated here — app/(public)/layout.tsx owns the header and
 * footer. This is the content region only.
 *
 * Dimensions are copied from page.tsx and components/community/voter-card.tsx
 * rather than approximated, so the swap to real content does not move the page.
 */

/** Mirrors components/community/voter-card.tsx: 40px avatar, meta lines, distribution bar, tags, compare button. */
function SkeletonVoterCard() {
  return (
    <div className="rounded-lg border border-[var(--poli-border)] p-4">
      <div className="mb-3 flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SkeletonText w="w-24" h="h-[14px]" />
          <SkeletonText w="w-2/3" h="h-[11px]" />
        </div>
      </div>

      {/* Stance distribution bar and its legend */}
      <div className="mb-3">
        <SkeletonBlock className="h-2 w-full rounded-full" />
        <div className="mt-1.5 flex gap-3">
          <SkeletonText w="w-16" h="h-[10px]" />
          <SkeletonText w="w-16" h="h-[10px]" />
        </div>
      </div>

      {/* Top stance tags */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <SkeletonBlock className="h-[18px] w-24 rounded-full" />
        <SkeletonBlock className="h-[18px] w-20 rounded-full" />
        <SkeletonBlock className="h-[18px] w-28 rounded-full" />
      </div>

      {/* Compare with me */}
      <SkeletonBlock className="h-[34px] w-full rounded-md" />
    </div>
  )
}

/**
 * Enough cards to fill roughly a viewport and a half at each breakpoint, and no
 * more: 4 in the single column, 6 at sm (2 up), 9 at lg (3 up). The real page
 * fetches 24, but rendering 24 placeholders is itself a cost.
 */
const CARD_VISIBILITY = [
  '',
  '',
  '',
  '',
  'hidden sm:block',
  'hidden sm:block',
  'hidden lg:block',
  'hidden lg:block',
  'hidden lg:block',
]

export default function CommunityLoading() {
  return (
    <SkeletonScreen label="Loading community voters">
      <main className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:px-10">
        {/* Title — h1 is clamp(28px,4vw,42px) at leading-[1.1], then a 15px/1.7 line.
            The subtitle is TWO lines below sm and one at sm and up: "See where
            anonymous voters stand on the issues. Compare your stances with
            theirs." is about 546px of 15px text, which fits the 592px content
            box at sm but not the 342px one at 390. Reserving one line here left
            the whole page 26px short on every phone. Measured: 30.8 + 8 + 51
            = 89.8, against the real 89.8. */}
        <div className="mb-6">
          <SkeletonBlock
            className="mb-2 w-[220px]"
            style={{ height: 'calc(clamp(28px, 4vw, 42px) * 1.1)' }}
          />
          <SkeletonBlock className="h-[51px] w-full max-w-[460px] sm:h-[25.5px]" />
        </div>

        {/* Five stat tiles */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-[var(--poli-border)] px-4 py-3 text-center"
            >
              {/* Line boxes, not glyph heights: the real tile stacks a
                  text-[18px] value (27px line) directly on a text-[11px]
                  label (16.5px line) with no margin between them. Sizing
                  these 18 and 11 with an mt-1 made each tile 59px against a
                  real 69.5 — 32px down the 3-row mobile grid, 11px at sm. */}
              <div className="mx-auto w-12">
                <SkeletonText w="w-full" h="h-[27px]" />
              </div>
              <div className="mx-auto w-16">
                <SkeletonText w="w-full" h="h-[16.5px]" />
              </div>
            </div>
          ))}
        </div>

        {/* All States pill, state select, result count */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {/* Measured on the real page: the pill is 30px, the <select> 38px
              (a select's line-height is the UA's 24px, not the 12px font
              size), and the count wraps to a second flex line at 18px. With
              gap-3 that is 38 + 12 + 18 = 68. */}
          <SkeletonBlock className="h-[30px] w-[88px] rounded-full" />
          <SkeletonBlock className="h-[38px] w-[150px] rounded-md" />
          <SkeletonText w="w-28" h="h-[18px]" />
        </div>

        {/* Voter grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARD_VISIBILITY.map((visibility, i) => (
            <div key={i} className={visibility}>
              <SkeletonVoterCard />
            </div>
          ))}
        </div>
      </main>
    </SkeletonScreen>
  )
}
