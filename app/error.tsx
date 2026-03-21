'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--codex-bg)]">
      <div className="mb-4 font-serif text-4xl text-[var(--codex-faint)]">Error</div>
      <h1 className="mb-2 font-serif text-2xl">Something went wrong</h1>
      <p className="mb-8 text-sm text-[var(--codex-sub)]">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)]"
      >
        Try again
      </button>
    </div>
  )
}
