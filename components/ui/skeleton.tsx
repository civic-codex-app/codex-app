/**
 * Skeleton primitives.
 *
 * Server components on purpose — a placeholder that needs JavaScript to appear
 * is no use, since the whole point is to occupy the gap before hydration.
 *
 * Colour comes from --poli-border so these are correct in both themes; the
 * one pre-existing skeleton in the app (issues/map/loading.tsx) already did
 * that and this matches it.
 *
 * The rule when using these: match the real layout's DIMENSIONS, not its
 * detail. A skeleton that shifts the page when the content replaces it turns
 * one wait into two visual events, which is worse than no skeleton at all.
 * Fidelity of shape matters; fidelity of texture does not.
 */
export function SkeletonBlock({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[var(--poli-border)] ${className}`}
      style={style}
    />
  )
}

/** A line of text. `w` and `h` are Tailwind classes so callers can match the real type size. */
export function SkeletonText({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-[var(--poli-border)] ${h} ${w}`} />
}

/**
 * Wraps a whole route's placeholder. Announces the wait once, politely,
 * instead of leaving a screen reader with a silent page — and marks the
 * subtree busy so its contents are not read out as if they were content.
 */
export function SkeletonScreen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

/** Mirrors components/directory/politician-card.tsx: 48px media rail, three text lines, chevron. */
export function SkeletonPoliticianRow() {
  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-[var(--poli-border)] px-3 py-[14px] sm:grid-cols-[56px_1fr_auto] sm:gap-4 sm:py-[18px]">
      <SkeletonBlock className="h-12 w-12 rounded-lg sm:h-14 sm:w-14" />
      <div className="min-w-0 space-y-2">
        <SkeletonText w="w-2/3" h="h-[15px]" />
        <SkeletonText w="w-1/3" h="h-3" />
      </div>
      <SkeletonBlock className="h-4 w-4 rounded" />
    </div>
  )
}

/**
 * Mirrors the card in app/(public)/directory/page.tsx:157-189 — which is NOT
 * components/directory/politician-card.tsx. The directory renders its grid
 * inline; PoliticianCard (and so SkeletonPoliticianRow above) belongs to the
 * dashboard, /following and politician-list.tsx. They are different shapes and
 * must stay separate: making one serve both regresses whichever it is not
 * measured against.
 *
 * Height is 93.5px at EVERY width, because the real card carries no responsive
 * classes:
 *   22.5  name, text-[15px] x the inherited 1.5 line-height
 * +  4    mt-1
 * + 18    state row, text-[12px] x 1.5 (the 12px party icon is shorter, so the
 *         text sets the line box)
 * +  4    mt-1
 * + 18    title row
 * + 24    py-3
 * +  3    1.5px border, top and bottom
 * = 93.5
 *
 * The media rail is w-[68px] and self-stretch, and there is no chevron. An
 * earlier version of this skeleton used a 48px column and a trailing chevron,
 * which pushed the text column 20px left and 34px right of where the real text
 * lands, and left every row 16.5px short on mobile — 198px of cumulative jump
 * down a 12-row single-column grid.
 */
export function SkeletonDirectoryCard() {
  return (
    <div className="flex overflow-hidden rounded-xl border-[1.5px] border-[var(--poli-border)]">
      <div
        aria-hidden="true"
        className="w-[68px] flex-shrink-0 self-stretch animate-pulse bg-[var(--poli-border)]"
      />
      <div className="min-w-0 flex-1 px-4 py-3">
        <SkeletonBlock className="h-[22.5px] w-[72%]" />
        <div className="mt-1 flex items-center gap-1.5">
          <SkeletonBlock className="h-3 w-3 rounded-full" />
          <SkeletonBlock className="h-[18px] w-7" />
        </div>
        <SkeletonBlock className="mt-1 h-[18px] w-[58%]" />
      </div>
    </div>
  )
}
