import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function IssueMapLoading() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        {/* Title skeleton */}
        <div className="mb-6">
          <div className="mb-2 h-9 w-48 animate-pulse rounded-md bg-[var(--poli-border)]" />
          <div className="h-4 w-80 animate-pulse rounded bg-[var(--poli-border)]" />
        </div>

        {/* Issue selector dropdown placeholder */}
        <div className="mb-6 h-11 w-72 animate-pulse rounded-lg bg-[var(--poli-border)]" />

        {/* US map placeholder — aspect ratio ~960:600 */}
        <div
          className="w-full animate-pulse rounded-xl bg-[var(--poli-border)]"
          style={{ aspectRatio: '960 / 600' }}
        />

        {/* Legend placeholder */}
        <div className="mt-4 flex items-center justify-center gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-3 w-3 animate-pulse rounded-sm bg-[var(--poli-border)]" />
              <div className="h-3 w-12 animate-pulse rounded bg-[var(--poli-border)]" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
