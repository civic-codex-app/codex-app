import { SkeletonBlock, SkeletonScreen, SkeletonText } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

/**
 * Placeholder for /compare.
 *
 * This models the page WITHOUT a pair selected: the title, the two-column
 * selector, and the "Select two officials to compare" panel. That is what
 * arriving from the nav shows, and arriving from the nav is how nearly every
 * visit starts — picking the two officials happens client-side afterwards and
 * never renders a loading state at all.
 *
 * An earlier version drew the full comparison instead: profile cards, the
 * agreement meter and the first rows of the issue table, about 1100px of it.
 * On the common entry that skeleton was roughly 900px taller than the page it
 * resolved to, so the content did not settle, it collapsed upwards. A skeleton
 * that is too SHORT only grows more page below the fold, which the reader does
 * not see; one that is too TALL yanks what they are already reading up the
 * screen. When the two cases cannot both be served — and loading.tsx cannot
 * read searchParams, so they cannot — err short.
 *
 * The consequence is deliberate: opening a shared /compare?a=…&b=… link shows
 * this short placeholder and then grows. That is the rarer entry and the
 * gentler failure.
 *
 * Measured against the real page at 390px (scripts/check-skeleton-fit.mjs):
 * title block 102.2, selector 197, empty panel 252.
 *
 * Chrome is not drawn here: app/(public)/layout.tsx already renders the header
 * and footer around this.
 */
export default function CompareLoading() {
  return (
    <SkeletonScreen label="Loading comparison">
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* Title block — h1 is clamp(32px,4vw,52px) at leading-[1.1], then a
            15px/1.7 standfirst that runs to two lines at this measure. */}
        <div className="mb-10 max-w-[600px]">
          <SkeletonBlock
            className="mb-4 w-[70%] max-w-[420px]"
            style={{ height: 'clamp(35px, 4.4vw, 57px)' }}
          />
          <div className="flex h-[51px] flex-col justify-around">
            <SkeletonText w="w-full" h="h-[15px]" />
            <SkeletonText w="w-4/5" h="h-[15px]" />
          </div>
        </div>

        {/* Selector: two autocomplete columns with the swap button between.
            Each column is an 11px label (16.5px line box) + mb-1.5 + a 46px
            input shell = 68.5. The labels are text-[11px], not the 13px an
            earlier version assumed, and the input is 46px rather than 38 — the
            two errors together left this block 23px short and pushed the panel
            below it up by the same amount. */}
        <div className="mb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex-1">
              <div className="mb-1.5">
                <SkeletonText w="w-20" h="h-[16.5px]" />
              </div>
              <SkeletonBlock className="h-[46px] w-full" />
            </div>

            {/* Swap button sits between the columns at every breakpoint */}
            <SkeletonBlock className="h-9 w-9 flex-shrink-0 self-center rounded-full sm:mt-5" />

            <div className="flex-1">
              <div className="mb-1.5">
                <SkeletonText w="w-20" h="h-[16.5px]" />
              </div>
              <SkeletonBlock className="h-[46px] w-full" />
            </div>
          </div>
        </div>

        {/* Empty panel: py-20, a text-2xl heading that wraps to two 32px lines
            below sm, mb-2, then a text-sm line. 160 + 64 + 8 + 20 = 252. */}
        <div className="py-20 text-center">
          <div className="mx-auto mb-2 h-[64px] w-full max-w-[320px] sm:h-8">
            <SkeletonBlock className="h-full w-full" />
          </div>
          <div className="mx-auto w-full max-w-[240px]">
            <SkeletonText w="w-full" h="h-5" />
          </div>
        </div>
      </div>
    </SkeletonScreen>
  )
}
