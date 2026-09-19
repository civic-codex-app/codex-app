/**
 * Surfaces for the app-shell redesign.
 *
 * The convention the rest of the app uses is a white page with outlined cards
 * (`rounded-* border border-[var(--poli-border)]`, 356 of them across 132
 * files). This is the other convention: a grey ground with white cards that
 * carry a shadow and no outline. Both are valid; mixing them on one screen is
 * not, which is why these are separate components rather than a tweak to the
 * border token.
 *
 * Tokens live in app/globals.css as --poli-app-*.
 */

/** The grey ground. Wrap a whole screen in this, not a section of one. */
export function AppShell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`min-h-screen bg-[var(--poli-app-bg)] ${className}`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)' }}
    >
      {children}
    </div>
  )
}

/** A white card. `flush` drops the padding for rows that manage their own. */
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
      className={`rounded-2xl bg-[var(--poli-app-card)] ${flush ? '' : 'p-4'} ${className}`}
      style={{ boxShadow: 'var(--poli-app-shadow)' }}
    >
      {children}
    </div>
  )
}

/** The near-black card the design uses for the one thing with a deadline. */
export function InkCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl bg-[var(--poli-app-ink)] p-5 text-white ${className}`}
      style={{ boxShadow: 'var(--poli-app-shadow-lg)' }}
    >
      {children}
    </div>
  )
}

/**
 * The small uppercase grey label above a group. 11px, wide tracking. Rendered
 * as a real heading so the section is navigable, with `as` to keep the
 * document outline sane on a screen that has several.
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
      <Tag className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-faint)]">
        {children}
      </Tag>
      {right}
    </div>
  )
}

/** A tinted status chip. */
export function Chip({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'good' | 'warn'
  children: React.ReactNode
}) {
  const tones = {
    neutral: 'bg-[var(--poli-badge-bg)] text-[var(--poli-badge-text)]',
    good: 'bg-[var(--poli-app-good-bg)] text-[var(--poli-app-good-ink)]',
    warn: 'bg-[var(--poli-app-warn-bg)] text-[var(--poli-app-warn-ink)]',
  } as const
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-[3px] text-[11.5px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
