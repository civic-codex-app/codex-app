import { SkeletonBlock, SkeletonScreen, SkeletonText } from '@/components/ui/skeleton'

/**
 * Placeholder for /bills.
 *
 * The page is `force-dynamic` — it awaits searchParams for the status and
 * session filters — so this is shown on every navigation to the route, not
 * just the first. That makes dimensional fidelity worth the fuss here.
 *
 * Measurements are copied from app/(public)/bills/page.tsx: the same
 * max-w-[1200px] container, the same mb-10/mb-8/space-y-3 rhythm, and text
 * bars wrapped in a fixed-height row so each placeholder occupies the real
 * line box rather than just the glyph height.
 *
 * No vote bar on the cards: `voting_records` is empty, and even when it is not
 * the bar is conditional per bill, so drawing one would shift every card.
 * No Header/Footer either — app/(public)/layout.tsx owns the chrome.
 */

/** A text line that occupies its real line box: `lh` is the line height, `h` the bar. */
function Line({ w, h = 'h-3', lh }: { w: string; h?: string; lh: string }) {
  return (
    <div className={`flex items-center ${lh}`}>
      <SkeletonText w={w} h={h} />
    </div>
  )
}

const STATS = [
  { value: 'w-10', label: 'w-[72px]' },
  { value: 'w-8', label: 'w-[46px]' },
  { value: 'w-8', label: 'w-[44px]' },
  { value: 'w-8', label: 'w-[100px]' },
]

// Six cards ≈ 1.5 viewports below the header and stats rail. More would be
// scroll cost for pixels nobody sees before the real list lands.
const CARDS = [
  { title: 'w-[72%]', summary: 'w-[88%]' },
  { title: 'w-[58%]', summary: 'w-[94%]' },
  { title: 'w-[80%]', summary: 'w-[70%]' },
  { title: 'w-[64%]', summary: 'w-[90%]' },
  { title: 'w-[76%]', summary: 'w-[82%]' },
  { title: 'w-[52%]', summary: 'w-[86%]' },
]

export default function BillsLoading() {
  return (
    <SkeletonScreen label="Loading bills and legislation">
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* Title block — h1 is text-[clamp(32px,4vw,52px)] at leading-[1.1] */}
        <div className="mb-10 max-w-[600px]">
          <SkeletonBlock className="mb-4 h-[clamp(35px,4.4vw,57px)] w-[82%]" />
          {/* Tagline: 15px / leading-[1.7] = a 25.5px line box. It wraps to two
              lines below sm and sits on one at sm and up. */}
          <Line w="w-full" h="h-[15px]" lh="h-[51px] sm:h-[25.5px]" />
          {/* Process explainer: 12px / leading-[1.6] = 19.2px a line. Four lines
              at 390px, two once the max-w-[600px] measure stops being the
              constraint. The last two are hidden at sm rather than the block
              being given one height, so the placeholder still reads as lines of
              prose. Measured against the real page: 190.9px at 390, 127.1 at
              768. Reserving one tagline line and three explainer lines made
              this block 45px short on every phone and 19px too tall on tablet,
              and the stats rail and the whole bill list moved by that much. */}
          <div className="mt-3">
            <Line w="w-full" lh="h-[19.2px]" />
            <Line w="w-full" lh="h-[19.2px]" />
            <Line w="w-full" lh="h-[19.2px] sm:hidden" />
            <Line w="w-2/3" lh="h-[19.2px] sm:hidden" />
          </div>
        </div>

        {/* Stats rail */}
        <div className="mb-8 flex flex-wrap gap-6 border-y border-[var(--poli-border)] py-4">
          {STATS.map((s, i) => (
            <div key={i} className="flex h-8 items-center gap-2">
              <SkeletonBlock className={`h-[20px] ${s.value}`} />
              <SkeletonBlock className={`h-3 ${s.label} rounded`} />
            </div>
          ))}
        </div>

        {/* Bill list */}
        <div className="space-y-3">
          {CARDS.map((c, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-[var(--poli-border)]">
              <div className="p-5">
                {/* Number + status + congress badges */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <SkeletonBlock className="h-[18px] w-16 rounded-sm" />
                  <SkeletonBlock className="h-[18px] w-24 rounded-sm" />
                  <SkeletonBlock className="h-[18px] w-28 rounded-sm" />
                </div>
                {/* Title: text-lg / leading-7 */}
                <div className="mb-1.5">
                  <Line w={c.title} h="h-[18px]" lh="h-7" />
                </div>
                {/* Summary: two clamped lines at 13px / leading-[1.6] */}
                <div className="mb-3">
                  <Line w="w-full" lh="h-[21px]" />
                  <Line w={c.summary} lh="h-[21px]" />
                </div>
                {/* Introduced date */}
                <div className="flex h-4 items-center">
                  <SkeletonBlock className="h-3 w-44 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  )
}
