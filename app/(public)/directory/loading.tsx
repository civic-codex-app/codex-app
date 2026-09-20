import { SkeletonBlock, SkeletonScreen, SkeletonDirectoryCard } from '@/components/ui/skeleton'

/**
 * Placeholder for /directory — the busiest dynamic route, and the one that
 * cannot be cached: it awaits searchParams for state/party/chamber/page, so
 * every request pays for the query.
 *
 * Dimensions are copied from page.tsx rather than approximated, because a
 * placeholder that resizes when the real markup lands turns one wait into two
 * visible events. Notes on the non-obvious numbers:
 *
 *  - The h1 is text-[clamp(28px,4vw,42px)] leading-[1.1], so the block's
 *    height is that same clamp times 1.1 rather than a fixed value — a fixed
 *    one would be wrong at every width but one.
 *  - Line heights are the inherited 1.5: the 14px count line is 21px, the
 *    11px filter labels 16.5px, and the search input is its py plus a 22.5px
 *    (15px x 1.5) line plus its 1px borders.
 *  - Twelve rows, not fifty. The page renders PAGE_SIZE = 50 per page, but
 *    twelve fills roughly a viewport and a half in the three-column grid;
 *    painting the other 38 would cost more than the wait they cover.
 *
 * The chrome is not repeated here — app/(public)/layout.tsx owns Header and
 * Footer for every public page, and a loading.tsx that rendered its own would
 * double them.
 */

/** Approximate pill widths, so the rows wrap the way the real filter rows wrap. */
const PARTY_PILLS = ['w-12', 'w-[127px]', 'w-[135px]', 'w-[140px]']
const LEVEL_PILLS = [
  'w-12',
  'w-[90px]',
  'w-[85px]',
  'w-[100px]',
  'w-[118px]',
  'w-[112px]',
  'w-[82px]',
  'w-[110px]',
  'w-[88px]',
  'w-[120px]',
  'w-[78px]',
]

export default function DirectoryLoading() {
  return (
    <SkeletonScreen label="Loading the politician directory">
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* h1 "Directory" */}
        <SkeletonBlock
          className="mb-1"
          style={{
            height: 'calc(clamp(28px, 4vw, 42px) * 1.1)',
            width: 'clamp(140px, 20vw, 210px)',
          }}
        />

        {/* "8,584 officials" */}
        <SkeletonBlock className="mb-6 h-[21px] w-32" />

        {/* SearchInput */}
        <SkeletonBlock className="mb-6 h-[52.5px] w-full rounded-xl sm:h-[55.75px]" />

        {/* DirectoryFilters — Party, Level, State */}
        <div className="mb-6 space-y-4">
          <div>
            <SkeletonBlock className="mb-2 h-[16.5px] w-10" />
            <div className="flex flex-wrap gap-1.5">
              {PARTY_PILLS.map((w) => (
                <SkeletonBlock key={w} className={`h-8 ${w}`} />
              ))}
            </div>
          </div>

          <div>
            <SkeletonBlock className="mb-2 h-[16.5px] w-10" />
            <div className="flex flex-wrap gap-1.5">
              {LEVEL_PILLS.map((w, i) => (
                <SkeletonBlock key={i} className={`h-8 ${w}`} />
              ))}
            </div>
          </div>

          <div>
            <SkeletonBlock className="mb-2 h-[16.5px] w-10" />
            <SkeletonBlock className="h-9 w-[150px]" />
          </div>
        </div>

        {/* Results grid */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonDirectoryCard key={i} />
          ))}
        </div>
      </div>
    </SkeletonScreen>
  )
}
