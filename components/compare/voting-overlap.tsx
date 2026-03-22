interface VotingOverlapProps {
  votingA: any[]
  votingB: any[]
  polA: any
  polB: any
}

const VOTE_COLORS: Record<string, { bg: string; text: string }> = {
  yea: { bg: '#22C55E18', text: '#22C55E' },
  nay: { bg: '#EF444418', text: '#EF4444' },
  abstain: { bg: '#9CA3AF18', text: '#9CA3AF' },
  not_voting: { bg: '#9CA3AF18', text: '#9CA3AF' },
}

// Check if a string looks like a UUID
function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

function getBillLabel(vote: any) {
  const name = vote.bill_name && !isUUID(vote.bill_name) ? vote.bill_name : null
  const number = vote.bill_number && !isUUID(vote.bill_number) ? vote.bill_number : null
  if (name && number) return `${name} (${number})`
  if (name) return name
  if (number) return number
  return null
}

export function VotingOverlap({ votingA, votingB, polA, polB }: VotingOverlapProps) {
  // Index B votes by bill_id for fast lookup
  const bByBill = new Map<string, any>()
  for (const v of votingB) {
    if (v.bill_id) bByBill.set(v.bill_id, v)
  }

  // Find shared votes (same bill_id)
  const shared: { label: string; voteA: string; voteB: string }[] = []
  for (const vA of votingA) {
    if (!vA.bill_id) continue
    const vB = bByBill.get(vA.bill_id)
    if (!vB) continue
    const label = getBillLabel(vA) ?? getBillLabel(vB)
    if (!label) continue // skip if both are UUIDs
    shared.push({
      label,
      voteA: vA.vote,
      voteB: vB.vote,
    })
  }

  // Calculate agreement (only yea/nay votes count)
  let agree = 0
  let disagree = 0
  for (const s of shared) {
    const a = s.voteA
    const b = s.voteB
    if ((a === 'yea' || a === 'nay') && (b === 'yea' || b === 'nay')) {
      if (a === b) agree++
      else disagree++
    }
  }
  const total = agree + disagree
  const agreePct = total > 0 ? Math.round((agree / total) * 100) : 0

  if (shared.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
          Voting Record Overlap
        </h2>
        <div className="rounded-md border border-[var(--codex-border)] px-6 py-8 text-center text-[13px] text-[var(--codex-faint)]">
          No shared voting records found
        </div>
      </div>
    )
  }

  const display = shared.slice(0, 10)

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
        Voting Record Overlap
      </h2>

      {/* Agreement bar */}
      {total > 0 && (
        <div className="mb-4 rounded-md border border-[var(--codex-border)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] text-[var(--codex-sub)]">Voting Agreement</span>
            <span className="text-lg font-semibold">{agreePct}%</span>
          </div>
          <div className="mb-1.5 flex h-2.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
            <div
              className="rounded-l-full"
              style={{
                width: `${agreePct}%`,
                background: 'linear-gradient(90deg, #22C55E88, #22C55E)',
              }}
            />
            <div
              className="rounded-r-full"
              style={{
                width: `${100 - agreePct}%`,
                background: 'linear-gradient(90deg, #EF4444, #EF444488)',
              }}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-green-400/70">{agree} agree</span>
            <span className="text-red-400/70">{disagree} disagree</span>
          </div>
        </div>
      )}

      {/* Shared bill votes */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[340px] space-y-1">
          {/* Header */}
          <div className="hidden gap-2 px-4 pb-1 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)] sm:grid sm:grid-cols-[1fr_80px_80px]">
            <span>Bill</span>
            <span className="text-center">{polA.name.split(' ').pop()}</span>
            <span className="text-center">{polB.name.split(' ').pop()}</span>
          </div>

          {display.map((s, i) => {
            const vcA = VOTE_COLORS[s.voteA] ?? VOTE_COLORS.abstain
            const vcB = VOTE_COLORS[s.voteB] ?? VOTE_COLORS.abstain

            return (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-md border border-[var(--codex-border)] px-4 py-2 sm:grid-cols-[1fr_80px_80px]"
              >
                <span className="truncate text-[13px] text-[var(--codex-text)]">
                  {s.label}
                </span>
                <div className="flex justify-center">
                  <span
                    className="rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em]"
                    style={{ color: vcA.text, background: vcA.bg }}
                  >
                    {s.voteA}
                  </span>
                </div>
                <div className="flex justify-center">
                  <span
                    className="rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em]"
                    style={{ color: vcB.text, background: vcB.bg }}
                  >
                    {s.voteB}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {shared.length > 10 && (
        <p className="mt-2 text-center text-[11px] text-[var(--codex-faint)]">
          Showing 10 of {shared.length} shared votes
        </p>
      )}
    </div>
  )
}
