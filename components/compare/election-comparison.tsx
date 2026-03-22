interface ElectionComparisonProps {
  electionsA: any[]
  electionsB: any[]
  polA: any
  polB: any
}

const RESULT_STYLES: Record<string, { bg: string; text: string }> = {
  won: { bg: '#22C55E18', text: '#22C55E' },
  lost: { bg: '#EF444418', text: '#EF4444' },
  runoff: { bg: '#EAB30818', text: '#EAB308' },
}

function ElectionColumn({ elections, name }: { elections: any[]; name: string }) {
  if (elections.length === 0) {
    return (
      <div>
        <div className="mb-2 text-[12px] font-medium text-[var(--codex-text)]">
          {name}
        </div>
        <div className="rounded-md border border-[var(--codex-border)] px-4 py-6 text-center text-[12px] text-[var(--codex-faint)]">
          No election history on record
        </div>
      </div>
    )
  }

  // Sort by year descending
  const sorted = [...elections].sort(
    (a, b) => (b.election_year ?? 0) - (a.election_year ?? 0)
  )

  const wins = sorted.filter((e) => e.result === 'won').length
  const losses = sorted.filter((e) => e.result === 'lost').length
  const votePcts = sorted
    .map((e) => e.vote_percentage)
    .filter((v): v is number => v != null)
  const avgPct =
    votePcts.length > 0
      ? Math.round(votePcts.reduce((a, b) => a + b, 0) / votePcts.length)
      : null

  return (
    <div>
      <div className="mb-2 text-[12px] font-medium text-[var(--codex-text)]">
        {name}
      </div>

      {/* Summary */}
      <div className="mb-3 flex items-center gap-3 text-[12px]">
        <span>
          <span className="text-green-400">{wins}W</span>
          <span className="text-[var(--codex-faint)]"> - </span>
          <span className="text-red-400">{losses}L</span>
        </span>
        {avgPct !== null && (
          <>
            <span className="text-[var(--codex-faint)]">|</span>
            <span className="text-[var(--codex-sub)]">Avg {avgPct}%</span>
          </>
        )}
      </div>

      {/* Election list */}
      <div className="space-y-1">
        {sorted.map((e, i) => {
          const rs = RESULT_STYLES[e.result] ?? RESULT_STYLES.lost

          return (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border border-[var(--codex-border)] px-3 py-1.5 text-[12px]"
            >
              <span className="w-10 tabular-nums text-[var(--codex-sub)]">
                {e.election_year ?? '—'}
              </span>
              <span
                className="rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]"
                style={{ color: rs.text, background: rs.bg }}
              >
                {e.result ?? '—'}
              </span>
              {e.vote_percentage != null && (
                <span className="ml-auto tabular-nums text-[var(--codex-text)]">
                  {e.vote_percentage}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ElectionComparison({
  electionsA,
  electionsB,
  polA,
  polB,
}: ElectionComparisonProps) {
  return (
    <div>
      <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
        Election History
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <ElectionColumn elections={electionsA} name={polA.name} />
        <ElectionColumn elections={electionsB} name={polB.name} />
      </div>
    </div>
  )
}
