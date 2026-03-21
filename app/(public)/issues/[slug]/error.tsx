'use client'

export default function IssueError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-4 font-serif text-[clamp(28px,4vw,42px)] leading-[1.1] text-[var(--codex-text)]">
          Something went wrong
        </div>
        <p className="mb-6 text-[15px] leading-[1.7] text-[var(--codex-sub)]">
          We couldn&apos;t load this issue&apos;s details. This may be a temporary issue.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center rounded-md border border-[var(--codex-border)] bg-[var(--codex-input-bg)] px-5 text-[13px] font-medium text-[var(--codex-text)] transition-all hover:border-[var(--codex-input-focus)] hover:bg-[var(--codex-hover)]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
