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
        <div className="mb-4 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] text-[var(--poli-text)]">
          Something went wrong
        </div>
        <p className="mb-6 text-[15px] leading-[1.7] text-[var(--poli-sub)]">
          We couldn&apos;t load this issue&apos;s details. This may be a temporary issue.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center rounded-md border border-[var(--poli-border)] bg-[var(--poli-input-bg)] px-5 text-[13px] font-medium text-[var(--poli-text)] transition-all hover:border-[var(--poli-input-focus)] hover:bg-[var(--poli-hover)]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
