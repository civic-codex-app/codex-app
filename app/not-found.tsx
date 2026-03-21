import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--codex-bg)]">
      <div className="mb-4 font-serif text-6xl text-[var(--codex-faint)]">404</div>
      <h1 className="mb-2 font-serif text-2xl">Page not found</h1>
      <p className="mb-8 text-sm text-[var(--codex-sub)]">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline"
      >
        Back to directory
      </Link>
    </div>
  )
}
