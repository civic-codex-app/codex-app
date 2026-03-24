'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--poli-bg)]">
      <div className="mb-4 text-4xl font-bold text-[var(--poli-faint)]">Error</div>
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-8 text-sm text-[var(--poli-sub)]">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--poli-text)] px-4 py-2 text-sm font-medium text-[var(--poli-bg)]"
      >
        Try again
      </button>
    </div>
  )
}
