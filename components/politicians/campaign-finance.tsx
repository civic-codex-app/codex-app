import { partyColor } from '@/lib/constants/parties'

interface FinanceRecord {
  id: string
  cycle: string
  total_raised: number | null
  total_spent: number | null
  cash_on_hand: number | null
  source: string | null
  last_updated: string | null
}

interface CampaignFinanceProps {
  records: FinanceRecord[]
  party: string
}

function formatMoney(amount: number | null): string {
  if (amount === null || amount === undefined) return '—'
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toFixed(0)}`
}

export function CampaignFinance({ records, party }: CampaignFinanceProps) {
  if (records.length === 0) return null

  const color = partyColor(party)

  // Find the max raised for bar scaling
  const maxRaised = Math.max(...records.map((r) => r.total_raised ?? 0), 1)

  return (
    <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
      <h2 className="mb-1 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
        Campaign Finance
      </h2>
      <p className="mb-4 text-[11px] text-[var(--codex-faint)]">
        Fundraising and spending data by election cycle
      </p>

      <div className="space-y-3">
        {records.map((r) => {
          const raised = r.total_raised ?? 0
          const spent = r.total_spent ?? 0
          const spentPct = raised > 0 ? Math.round((spent / raised) * 100) : 0

          return (
            <div
              key={r.id}
              className="rounded-md border border-[var(--codex-border)] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                  {r.cycle} Cycle
                </span>
                {r.source && (
                  <span className="text-[11px] text-[var(--codex-faint)]">
                    Source: {r.source}
                  </span>
                )}
              </div>

              {/* Raised bar */}
              <div className="mb-3">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
                    Total Raised
                  </span>
                  <span className="text-lg font-semibold" style={{ color }}>
                    {formatMoney(r.total_raised)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--codex-border)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(raised / maxRaised) * 100}%`,
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                    }}
                  />
                </div>
              </div>

              {/* Spent bar (nested inside raised) */}
              <div className="mb-3">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
                    Total Spent
                  </span>
                  <span className="text-[13px] text-[var(--codex-sub)]">
                    {formatMoney(r.total_spent)}
                    <span className="ml-1 text-[11px] text-[var(--codex-faint)]">({spentPct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${spentPct}%`,
                      background: `${color}66`,
                    }}
                  />
                </div>
              </div>

              {/* Cash on hand */}
              {r.cash_on_hand !== null && (
                <div className="flex items-baseline justify-between border-t border-[var(--codex-border)] pt-2">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
                    Cash on Hand
                  </span>
                  <span className="text-base font-semibold text-[var(--codex-text)]">
                    {formatMoney(r.cash_on_hand)}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
