import { partyColor, partyLabel } from '@/lib/constants/parties'

interface ElectionResult {
  id: string
  election_year: number
  state: string
  chamber: string
  district: string | null
  race_name: string
  party: string
  result: 'won' | 'lost' | 'runoff'
  vote_percentage: number | null
  total_votes: number | null
  opponent_name: string | null
  opponent_party: string | null
  opponent_vote_percentage: number | null
  is_special_election: boolean
  is_runoff: boolean
  notes: string | null
}

interface ElectionHistoryProps {
  results: ElectionResult[]
  party: string
}

const RESULT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  won: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Won' },
  lost: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Lost' },
  runoff: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Runoff' },
}

function formatVotes(n: number): string {
  return n.toLocaleString('en-US')
}

export function ElectionHistory({ results, party }: ElectionHistoryProps) {
  if (results.length === 0) return null

  const color = partyColor(party)

  return (
    <div className="mt-8 border-t border-[var(--poli-border)] pt-6">
      <h2 className="mb-4 text-sm font-semibold text-[var(--poli-sub)]">
        Election History
      </h2>
      <div className="space-y-3">
        {results.map((r) => {
          const style = RESULT_STYLE[r.result] ?? RESULT_STYLE.won
          const oppColor = r.opponent_party ? partyColor(r.opponent_party) : 'var(--poli-faint)'

          return (
            <div key={r.id} className="rounded-md border border-[var(--poli-border)] px-4 py-3">
              {/* Top row: year, race name, result */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-[var(--poli-badge-bg)] px-1.5 py-0.5 text-[11px] tabular-nums font-medium text-[var(--poli-badge-text)]">
                    {r.election_year}
                  </span>
                  <span className="text-[13px] font-medium">{r.race_name}</span>
                  {r.is_special_election && (
                    <span className="rounded-sm bg-[var(--poli-badge-bg)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-[var(--poli-faint)]">
                      Special
                    </span>
                  )}
                </div>
                <span className={`flex-shrink-0 rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.06em] ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>

              {/* Vote percentage */}
              {r.vote_percentage != null && (
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-lg font-semibold" style={{ color }}>
                    {r.vote_percentage}%
                  </span>
                  {r.total_votes != null && (
                    <span className="text-[11px] tabular-nums text-[var(--poli-faint)]">
                      {formatVotes(r.total_votes)} votes
                    </span>
                  )}
                </div>
              )}

              {/* Opponent */}
              {r.opponent_name && (
                <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--poli-faint)]">
                  <span>vs.</span>
                  <span style={{ color: oppColor }}>{r.opponent_name}</span>
                  {r.opponent_party && (
                    <span>({partyLabel(r.opponent_party).charAt(0)})</span>
                  )}
                  {r.opponent_vote_percentage != null && (
                    <span className="tabular-nums">— {r.opponent_vote_percentage}%</span>
                  )}
                </div>
              )}

              {/* Notes */}
              {r.notes && (
                <div className="mt-1 text-[11px] italic text-[var(--poli-faint)]">
                  {r.notes}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
