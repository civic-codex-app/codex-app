/**
 * Provenance note for any surface that renders politician stances.
 *
 * Every politician_issues row is template-generated: 8,584 politicians x 22
 * issues, each with a definite position and a written summary, and not one
 * 'unknown' among them. None cites a source, so is_verified is false across
 * the board (see scripts/unverify-unsourced-stances.mjs).
 *
 * The decision was to keep that data and label it rather than delete it,
 * which makes this note the safeguard rather than a nicety. Any new surface
 * that displays a stance should render it.
 */
export function EstimatedStanceNote({ className = '' }: { className?: string }) {
  return (
    <p
      className={`rounded-md border border-[var(--poli-border)] px-3 py-2 text-[12px] leading-relaxed text-[var(--poli-faint)] ${className}`}
    >
      Stances are estimated, not sourced to each official&rsquo;s public record.
      Treat them as a starting point and check a politician&rsquo;s own
      statements before relying on them.
    </p>
  )
}
