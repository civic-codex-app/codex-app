import { AppShell, Card } from '@/components/app/surface'

/** The feed's skeleton: header, a prompt-or-hero card, and a list of rows. */
export default function FeedLoading() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[560px] px-4 pt-5">
        <header className="mb-3 flex items-center justify-between px-1">
          <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Feed</h1>
          <div className="h-[18px] w-20 animate-pulse rounded bg-[var(--poli-border)]" />
        </header>
        <Card className="mb-4">
          <div className="mb-3 h-[22px] w-2/3 animate-pulse rounded bg-[var(--poli-border)]" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--poli-border)]" />
        </Card>
        <div className="mb-2 h-[13px] w-32 animate-pulse rounded bg-[var(--poli-border)]" />
        <Card flush className="px-3.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex items-start gap-3 py-3 ${i < 3 ? 'border-b border-[var(--poli-border)]' : ''}`}>
              <div className="h-[14px] w-11 shrink-0 animate-pulse rounded bg-[var(--poli-border)]" />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 h-[17px] w-full animate-pulse rounded bg-[var(--poli-border)]" />
                <div className="h-[14px] w-1/3 animate-pulse rounded bg-[var(--poli-border)]" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  )
}
