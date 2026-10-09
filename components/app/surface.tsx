/**
 * Surfaces. One model, in both themes: a ground, then cards with a 1px
 * hairline. A card never carries a shadow (shadows vanish in dark mode) and
 * the app never puts a dark panel inside the light theme; dark is a theme,
 * not a card. Tokens live in app/globals.css as --poli-*.
 */

/** The ground. Wrap a whole screen in this, not a section of one. */
export function AppShell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`min-h-screen bg-[var(--poli-bg)] ${className}`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)' }}
    >
      {children}
    </div>
  )
}

/** A card. `flush` drops the padding for rows that manage their own. */
export function Card({
  children,
  className = '',
  flush = false,
}: {
  children: React.ReactNode
  className?: string
  flush?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--poli-border)] bg-[var(--poli-card)] ${flush ? '' : 'p-4'} ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * The small uppercase label above a group: 11px, wide tracking, in --poli-sub
 * (--poli-faint is for icons; as text it fails contrast in both themes).
 * Rendered as a real heading so the section is navigable, with `as` to keep
 * the document outline sane on a screen that has several.
 */
export function SectionLabel({
  children,
  right,
  as: Tag = 'h2',
}: {
  children: React.ReactNode
  right?: React.ReactNode
  as?: 'h2' | 'h3'
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
      <Tag className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">
        {children}
      </Tag>
      {right}
    </div>
  )
}

/**
 * A chip. `marker` is the brand accent: a fill with ink text on it, for the
 * one thing on the screen that is the visitor's to act on. Use it once.
 */
export function Chip({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'good' | 'warn' | 'marker'
  children: React.ReactNode
}) {
  const tones = {
    neutral: 'bg-[var(--poli-badge-bg)] text-[var(--poli-badge-text)]',
    good: 'bg-[var(--poli-app-good-bg)] text-[var(--poli-app-good-ink)]',
    warn: 'bg-[var(--poli-app-warn-bg)] text-[var(--poli-app-warn-ink)]',
    marker: 'bg-[var(--poli-marker)] text-[var(--poli-marker-ink)]',
  } as const
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-[3px] text-[11.5px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
