import {
  SkeletonBlock,
  SkeletonScreen,
  SkeletonText,
} from '@/components/ui/skeleton'

/**
 * Placeholder for /feed.
 *
 * The page is `force-dynamic` (it reads party/state/page) and one of its five
 * parallel fetches is a Google News RSS call with an 8s timeout, so this is
 * on screen for a real length of time rather than a frame.
 *
 * Chrome is not rendered here: app/(public)/layout.tsx owns <Header /> and
 * <Footer /> for every public page, so a loading.tsx that drew either would
 * paint a second copy of both.
 *
 * Shapes match page.tsx section for section, with one deliberate omission:
 * the "Latest Activity" list and its pagination are absent because
 * `voting_records` holds 0 rows (verified again against the live database on
 * 2026-09-19), so `items` is always empty and that whole block never renders.
 * Drawing six activity rows here would add ~400px the real page never fills,
 * which is exactly the shift a skeleton exists to prevent. If votes are ever
 * rebuilt, add the rows back alongside them.
 */

/**
 * Article rows in NewsHighlightCard — widths only.
 *
 * Line COUNT is not per-row here, because it is not a property of the row: the
 * same headline wraps to two lines in the 342px content box at 390 and one in
 * the 688px box at 768. Measured on the real card, every article row is 70.9px
 * on a phone and 52.7px on a tablet. Mixing one- and two-line rows at a fixed
 * count averaged 1.4 lines and left this panel 110px short on mobile and 36px
 * too tall on tablet, so the fundraisers row below it moved by that much.
 *
 * Ten rows against a real ten-article slice still leaves about ±18px, because
 * a few real headlines are short enough not to wrap. That residual sits ~1400px
 * down the page, well below the fold, and cannot be fixed from here: the
 * heights depend on the actual Google News text.
 */
const NEWS_ROWS: string[] = [
  'w-11/12', 'w-4/5', 'w-3/4', 'w-full', 'w-5/6',
  'w-2/3', 'w-11/12', 'w-3/4', 'w-4/5', 'w-5/6',
]

/** Party pills in FeedFilters: All Parties / Democrat / Republican / Independent. */
const FILTER_PILL_WIDTHS = ['w-[88px]', 'w-[92px]', 'w-[104px]', 'w-[110px]']

/** Mirrors components/feed/news-highlight-card.tsx (10 articles, the card's own slice). */
function NewsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <SkeletonBlock className="h-4 w-4 rounded" />
        <SkeletonText w="w-[150px]" h="h-3" />
      </div>

      <div className="space-y-3">
        {NEWS_ROWS.map((w, i) => (
          <div key={i} className="flex items-start gap-3 p-2">
            <SkeletonBlock className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              {/* headline: text-[13px] leading-[1.4] = an 18.2px line box */}
              <div className="flex h-[18.2px] items-center">
                <SkeletonText w={w} h="h-[13px]" />
              </div>
              {/* second line on phones only — see NEWS_ROWS */}
              <div className="flex h-[18.2px] items-center sm:hidden">
                <SkeletonText w="w-1/2" h="h-[13px]" />
              </div>
              {/* source + timestamp: text-[11px] = a 16.5px line box */}
              <div className="mt-0.5 flex h-[16.5px] items-center">
                <SkeletonText w="w-[128px]" h="h-[11px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Mirrors components/feed/poll-card.tsx (4 options, the card's own slice). */
function PollCardSkeleton() {
  return (
    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <SkeletonBlock className="h-4 w-4 rounded" />
        <SkeletonText w="w-[112px]" h="h-3" />
        <div className="ml-auto">
          <SkeletonText w="w-[58px]" h="h-3" />
        </div>
      </div>

      {/* question: text-[15px] leading-[1.3], two lines */}
      <div className="mb-4">
        <div className="flex h-[20px] items-center">
          <SkeletonText w="w-full" h="h-[15px]" />
        </div>
        <div className="flex h-[20px] items-center">
          <SkeletonText w="w-3/5" h="h-[15px]" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[34px] w-full rounded-lg" />
        ))}
      </div>

      <div className="mt-3 flex h-[18px] items-center">
        <SkeletonText w="w-[56px]" h="h-3" />
      </div>
    </div>
  )
}

/** Mirrors components/feed/election-countdown-card.tsx. */
function ElectionCountdownSkeleton() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-4 rounded" />
          <SkeletonText w="w-[104px]" h="h-3" />
        </div>
        {/* days-left counter: text-[20px] font-bold */}
        <SkeletonText w="w-[56px]" h="h-[20px]" />
      </div>

      {/* race name: text-[15px] leading-[1.3] */}
      <div className="mb-1 flex h-[20px] items-center">
        <SkeletonText w="w-4/5" h="h-[15px]" />
      </div>
      {/* state + date: text-[12px] */}
      <div className="mb-3 flex h-[16px] items-center">
        <SkeletonText w="w-2/5" h="h-3" />
      </div>

      <div className="mb-3 flex -space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-8 flex-shrink-0 rounded-full" />
        ))}
      </div>

      <div className="flex h-[16px] items-center">
        <SkeletonText w="w-[76px]" h="h-3" />
      </div>
    </div>
  )
}

/** Mirrors components/feed/finance-highlight-card.tsx (5 rows, the query's limit). */
function FinanceCardSkeleton() {
  return (
    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <SkeletonBlock className="h-4 w-4 rounded" />
        <SkeletonText w="w-[112px]" h="h-3" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonText w="w-4" h="h-3" />
            <SkeletonBlock className="h-8 w-8 flex-shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="flex h-[18px] items-center">
                <SkeletonText w="w-2/3" h="h-[13px]" />
              </div>
              <SkeletonBlock className="mt-1 h-1.5 w-full rounded-full" />
            </div>
            <SkeletonBlock className="h-[13px] w-[52px] flex-shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FeedLoading() {
  return (
    <SkeletonScreen label="Loading the activity feed">
      {/* same container as page.tsx */}
      <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:px-10">
        {/* Page header */}
        <div className="mb-6">
          {/* h1 "Feed": text-[clamp(28px,4vw,42px)] leading-[1.1] */}
          <SkeletonBlock
            className="mb-2 w-[104px]"
            style={{ height: 'calc(clamp(28px, 4vw, 42px) * 1.1)' }}
          />
          {/* Standfirst: text-[15px] leading-[1.7] = a 25.5px line box. "The
              latest in politics — news, votes and races" wraps to two lines
              below sm; reserving one left the filters, the trending panel and
              the whole feed 25px high on every phone. */}
          <div className="h-[51px] sm:h-[25.5px]">
            <SkeletonText w="w-[320px] max-w-full" h="h-[15px]" />
          </div>
        </div>

        {/* Filters: four party pills + the state select */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_PILL_WIDTHS.map((w) => (
              <SkeletonBlock key={w} className={`h-[30px] rounded-full ${w}`} />
            ))}
          </div>
          <SkeletonBlock className="h-[30px] w-[116px] rounded-lg" />
        </div>

        {/* Top row: news + sidebar */}
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_340px]">
          <NewsCardSkeleton />
          <div className="flex flex-col gap-5">
            <PollCardSkeleton />
            <ElectionCountdownSkeleton />
          </div>
        </div>

        {/* Middle row: top fundraisers + the next two races */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FinanceCardSkeleton />
          <ElectionCountdownSkeleton />
          <ElectionCountdownSkeleton />
        </div>
      </div>
    </SkeletonScreen>
  )
}
