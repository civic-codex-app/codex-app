'use client'

import { useState } from 'react'
import { Card } from '@/components/app/surface'
import { BottomSheet, SheetDone } from '@/components/app/sheet'

export interface FinanceRow {
  id: string
  cycle: string
  total_raised: number | null
  total_spent: number | null
  cash_on_hand: number | null
  source: string | null
}

export function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

/** "FEC API (candidates/totals, cycle 2026, through 2026-07-15)" → "Jul 15, 2026" */
function coverage(source: string | null): string | null {
  const m = source?.match(/through (\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Money: the latest cycle's receipts as the number, every cycle on file as a
 * bar you can tap, spent and cash on hand as two tiles. Each row is a real
 * FEC total (campaign_finance.source says which filing and through when);
 * the current cycle is drawn as an outline because it is still open.
 */
export function MoneyCard({ records, name }: { records: FinanceRow[]; name: string }) {
  const rows = [...records]
    .filter((r) => r.total_raised !== null)
    .sort((a, b) => a.cycle.localeCompare(b.cycle))
    .slice(-5)
  const [sel, setSel] = useState(Math.max(0, rows.length - 1))
  const [info, setInfo] = useState(false)
  if (!rows.length) return null

  const latest = rows[rows.length - 1]
  const max = Math.max(...rows.map((r) => r.total_raised ?? 0), 1)
  const through = coverage(latest.source)
  const cycleEnd = `${latest.cycle}-12-31`
  const open = !!latest.source?.match(/through (\d{4}-\d{2}-\d{2})/) && (latest.source.match(/through (\d{4}-\d{2}-\d{2})/)?.[1] ?? '') < cycleEnd

  return (
    <Card className="mb-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">Money</h2>
        <button
          type="button"
          onClick={() => setInfo(true)}
          aria-label="About these numbers"
          className="-my-1.5 -mr-2 flex h-8 w-8 items-center justify-center rounded-full text-[var(--poli-faint)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5v.5" /></svg>
        </button>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[var(--poli-text)]">{money(latest.total_raised)}</span>
        <span className="text-[15px] font-medium text-[var(--poli-sub)]">raised, {latest.cycle} cycle</span>
      </div>

      {rows.length > 1 && (
        <div className="mt-4 flex items-end gap-2.5">
          {rows.map((r, i) => {
            const on = i === sel
            const partial = i === rows.length - 1 && open
            const h = Math.round(((r.total_raised ?? 0) / max) * 120)
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={on}
                aria-label={`${r.cycle}: ${money(r.total_raised)} raised`}
                className="flex h-[176px] flex-1 flex-col items-center justify-end gap-1.5"
              >
                {on && (
                  <span className="poli-fade rounded-sm bg-[var(--poli-text)] px-1.5 py-[3px] text-[12px] font-bold tabular-nums text-[var(--poli-card)]">
                    {money(r.total_raised)}
                  </span>
                )}
                <span
                  className="w-full rounded-t-md"
                  style={{
                    height: Math.max(h, 4),
                    background: on ? 'var(--poli-text)' : partial ? 'transparent' : 'var(--poli-faint)',
                    border: partial && !on ? '1.5px dashed var(--poli-faint)' : undefined,
                    boxSizing: 'border-box',
                  }}
                />
                <span className={`text-[12px] tabular-nums text-[var(--poli-sub)] ${on ? 'font-bold' : 'font-medium'}`}>
                  {r.cycle}
                  {partial ? '*' : ''}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[var(--poli-badge-bg)] px-3 py-2.5">
          <div className="text-[12px] font-semibold text-[var(--poli-sub)]">Spent</div>
          <div className="mt-0.5 text-[20px] font-bold tabular-nums text-[var(--poli-text)]">{money(rows[sel]?.total_spent)}</div>
        </div>
        <div className="rounded-xl bg-[var(--poli-badge-bg)] px-3 py-2.5">
          <div className="text-[12px] font-semibold text-[var(--poli-sub)]">Cash on hand</div>
          <div className="mt-0.5 text-[20px] font-bold tabular-nums text-[var(--poli-text)]">{money(rows[sel]?.cash_on_hand)}</div>
        </div>
      </div>

      <BottomSheet open={info} onClose={() => setInfo(false)} label="About these numbers">
        <h2 className="font-serif text-[32px] font-normal leading-[1.08] text-[var(--poli-text)]">About these numbers</h2>
        <p className="mt-3 text-[15px] leading-[1.5] text-[var(--poli-sub)]">
          From {name}&rsquo;s FEC filings. Each bar is one two-year cycle
          {through ? `; ${latest.cycle} runs through ${through}` : ''}.
          {open ? ' The open cycle is drawn as an outline.' : ''}
        </p>
        {latest.source && <p className="mt-2 text-[12.5px] leading-[1.45] text-[var(--poli-faint)]">{latest.source}</p>}
        <SheetDone onClick={() => setInfo(false)} />
      </BottomSheet>
    </Card>
  )
}
