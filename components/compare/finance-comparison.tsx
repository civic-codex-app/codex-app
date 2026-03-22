interface FinanceComparisonProps {
  financeA: any[]
  financeB: any[]
  polA: any
  polB: any
}

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
  return `$${amount.toLocaleString()}`
}

const COLOR_A = '#6366F1' // indigo
const COLOR_B = '#F97316' // orange

export function FinanceComparison({ financeA, financeB, polA, polB }: FinanceComparisonProps) {
  const colorA = COLOR_A
  const colorB = COLOR_B

  // Get most recent cycle for each
  const latestA = financeA.length > 0
    ? financeA.reduce((a, b) => ((a.cycle ?? 0) > (b.cycle ?? 0) ? a : b))
    : null
  const latestB = financeB.length > 0
    ? financeB.reduce((a, b) => ((a.cycle ?? 0) > (b.cycle ?? 0) ? a : b))
    : null

  if (!latestA && !latestB) {
    return (
      <div className="mb-8">
        <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
          Campaign Finance
        </h2>
        <div className="rounded-md border border-[var(--codex-border)] px-6 py-8 text-center text-[13px] text-[var(--codex-faint)]">
          No campaign finance data on record
        </div>
      </div>
    )
  }

  const metrics: { label: string; keyA: number; keyB: number }[] = [
    {
      label: 'Total Raised',
      keyA: latestA?.total_raised ?? 0,
      keyB: latestB?.total_raised ?? 0,
    },
    {
      label: 'Total Spent',
      keyA: latestA?.total_spent ?? 0,
      keyB: latestB?.total_spent ?? 0,
    },
    {
      label: 'Cash on Hand',
      keyA: latestA?.cash_on_hand ?? 0,
      keyB: latestB?.cash_on_hand ?? 0,
    },
  ]

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
        Campaign Finance
      </h2>

      <div className="space-y-4 rounded-md border border-[var(--codex-border)] p-4 sm:p-5">
        {/* Cycle labels */}
        <div className="flex items-center justify-between text-[11px] text-[var(--codex-faint)]">
          <span>{latestA ? `${polA.name.split(' ').pop()} (${latestA.cycle})` : '—'}</span>
          <span>{latestB ? `${polB.name.split(' ').pop()} (${latestB.cycle})` : '—'}</span>
        </div>

        {metrics.map((m) => {
          const max = Math.max(m.keyA, m.keyB, 1)
          const pctA = (m.keyA / max) * 100
          const pctB = (m.keyB / max) * 100

          return (
            <div key={m.label}>
              <div className="mb-1.5 text-[12px] text-[var(--codex-sub)]">{m.label}</div>

              {/* Bar A */}
              <div className="mb-1 flex items-center gap-2">
                <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pctA}%`, background: colorA }}
                  />
                </div>
                <span className="w-16 text-right text-[12px] tabular-nums text-[var(--codex-text)]">
                  {m.keyA > 0 ? formatMoney(m.keyA) : '—'}
                </span>
              </div>

              {/* Bar B */}
              <div className="flex items-center gap-2">
                <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pctB}%`, background: colorB }}
                  />
                </div>
                <span className="w-16 text-right text-[12px] tabular-nums text-[var(--codex-text)]">
                  {m.keyB > 0 ? formatMoney(m.keyB) : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
