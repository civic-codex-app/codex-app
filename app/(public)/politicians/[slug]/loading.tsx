import { SkeletonBlock, SkeletonText, SkeletonScreen } from '@/components/ui/skeleton'

/**
 * Placeholder for /politicians/[slug].
 *
 * The page is ISR-cached (generateStaticParams returns [] so nothing is
 * prerendered at build), which means this shows on a cache MISS only — the
 * first visitor to each profile, who waits 1-4s on seven parallel Supabase
 * queries plus the news fetch.
 *
 * Every dimension here is copied from page.tsx rather than eyeballed, because
 * a placeholder that is the wrong height moves the page when the real content
 * lands and turns one wait into two visual events:
 *
 *   wrapper         mx-auto max-w-[1200px] px-6 pt-6 md:px-10
 *   back button     mb-8, text-sm
 *   columns         grid gap-10 md:grid-cols-[340px_1fr]
 *   portrait        aspect-[3/4] w-full rounded-xl, hidden below md
 *   mobile avatar   h-40 w-40 rounded-xl in a mb-5 flex row, hidden at md
 *   name            text-[28px]/1.05 mobile, text-[38px]/1.05 desktop
 *   action row      mb-7, height set by LikeButton's min-h-[44px]
 *   link buttons    mb-9 grid-cols-2 gap-2.5, px-4 py-3 text-[13px] => 42px
 *   tab strip       border-b, py-3 text-[13px] desktop / py-2 text-[12px] mobile
 *   tab body        mt-6
 *
 * No Header or Footer: app/(public)/layout.tsx renders those for every public
 * page, so a loading.tsx renders the content region only.
 */
export default function PoliticianProfileLoading() {
  return (
    <SkeletonScreen label="Loading politician profile">
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* Back */}
        <div className="mb-8">
          <SkeletonText w="w-16" h="h-5" />
        </div>

        <div className="grid gap-10 md:grid-cols-[340px_1fr]">
          {/* Desktop portrait — the real <Image> is aspect-[3/4] w-full rounded-xl */}
          <div className="hidden md:block">
            <SkeletonBlock className="w-full rounded-xl" style={{ aspectRatio: '3 / 4' }} />
          </div>

          <div className="min-w-0">
            {/* Mobile: 160px avatar + party icon + name */}
            <div className="mb-5 flex items-center gap-4 md:hidden">
              <SkeletonBlock className="h-40 w-40 flex-shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-8 w-8 rounded-full" />
                <div className="mt-1.5 space-y-1.5">
                  <SkeletonText w="w-full" h="h-[29px]" />
                  <SkeletonText w="w-2/3" h="h-[29px]" />
                </div>
              </div>
            </div>

            {/* Desktop: party icon (40px) then the 38px name */}
            <div className="mb-3 hidden md:block">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
            </div>
            <div className="mb-4 hidden md:block">
              <SkeletonText w="w-[420px] max-w-full" h="h-10" />
            </div>

            {/* Action pills: like (44px), Compare, export, Suggest Update, socials */}
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <SkeletonBlock className="h-11 w-[72px] rounded-md" />
              <SkeletonBlock className="h-9 w-[108px] rounded-full" />
              <SkeletonBlock className="h-9 w-9 rounded-full" />
              <SkeletonBlock className="h-9 w-[140px] rounded-full" />
              <SkeletonBlock className="h-9 w-9 rounded-full" />
              <SkeletonBlock className="h-9 w-9 rounded-full" />
            </div>

            {/* Link buttons — two is the common case (website + wikipedia) */}
            <div className="mb-9 grid grid-cols-2 gap-2.5">
              <SkeletonBlock className="h-[42px] w-full rounded-md" />
              <SkeletonBlock className="h-[42px] w-full rounded-md" />
            </div>

            {/* Title + metadata line */}
            <div className="mb-1">
              <SkeletonText w="w-56" h="h-[18px]" />
            </div>
            <SkeletonText w="w-72" h="h-5" />

            {/* Tab strip — six tabs at most; the real one hides empty sections */}
            <div className="border-b border-[var(--poli-border)]">
              <div className="flex gap-0 overflow-hidden py-2 sm:hidden">
                {['w-16', 'w-14', 'w-20', 'w-24', 'w-24', 'w-20'].map((w, i) => (
                  <div key={i} className="flex flex-1 justify-center py-2">
                    <SkeletonText w={`${w} max-w-full`} h="h-3.5" />
                  </div>
                ))}
              </div>
              <div className="hidden gap-0 overflow-hidden sm:flex">
                {['w-16', 'w-14', 'w-24', 'w-32', 'w-28', 'w-20'].map((w, i) => (
                  <div key={i} className="shrink-0 px-4 py-3 sm:px-5">
                    <SkeletonText w={w} h="h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Overview body: alignment gauge, then the report card */}
            <div className="mt-6">
              <div className="rounded-md border border-[var(--poli-border)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <SkeletonText w="w-40" h="h-5" />
                  <SkeletonBlock className="h-5 w-24 rounded-sm" />
                </div>
                <SkeletonBlock className="mb-2 h-2 w-full rounded-full" />
                <div className="flex items-baseline justify-between">
                  <SkeletonText w="w-16" h="h-8" />
                  <SkeletonText w="w-28" h="h-3.5" />
                </div>
              </div>

              <div className="mt-8 border-t border-[var(--poli-border)] pt-6">
                <div className="rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] p-5">
                  <div className="mb-5">
                    <SkeletonText w="w-44" h="h-5" />
                  </div>
                  <div className="mb-6 flex items-center gap-5">
                    <SkeletonBlock className="h-[88px] w-[88px] flex-shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <SkeletonBlock className="h-6 w-28 rounded-full" />
                      <SkeletonText w="w-52" h="h-4" />
                    </div>
                  </div>
                  <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonBlock key={i} className="h-[52px] w-full rounded-md" />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonBlock key={i} className="h-9 w-full rounded-md" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonScreen>
  )
}
