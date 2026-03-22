import Link from 'next/link'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { AvatarImage } from '@/components/ui/avatar-image'
import { AlignmentBar } from './alignment-bar'
import type { Race, Candidate } from '@/lib/utils/fetch-ballot'

export interface CandidateScore {
  score: number
  matched: number
  total: number
}

interface ScorecardRaceCardProps {
  race: Race
  candidateScores: Map<string, CandidateScore>
}

export function ScorecardRaceCard({ race, candidateScores }: ScorecardRaceCardProps) {
  const chamberLabel =
    CHAMBER_LABELS[race.chamber as ChamberKey] ?? race.chamber

  // Sort candidates by score descending
  const sortedCandidates = [...race.candidates].sort((a, b) => {
    const scoreA = candidateScores.get(a.id)?.score ?? -1
    const scoreB = candidateScores.get(b.id)?.score ?? -1
    return scoreB - scoreA
  })

  return (
    <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)]">
      {/* Header */}
      <div className="border-b border-[var(--codex-border)] px-5 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
            {chamberLabel}
          </span>
          {race.district && (
            <span className="text-[11px] text-[var(--codex-faint)]">
              District {race.district}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-[var(--codex-text)]">
          {race.name}
        </h3>
        {race.election_date && (
          <p className="mt-0.5 text-[11px] text-[var(--codex-faint)]">
            {race.election_name} &middot;{' '}
            {new Date(race.election_date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Candidates */}
      {sortedCandidates.length > 0 ? (
        <div className="divide-y divide-[var(--codex-border)]">
          {sortedCandidates.map((candidate) => {
            const scoreData = candidateScores.get(candidate.id)
            return (
              <ScorecardCandidateRow
                key={candidate.id}
                candidate={candidate}
                scoreData={scoreData ?? null}
              />
            )
          })}
        </div>
      ) : (
        <div className="px-5 py-6 text-center text-sm text-[var(--codex-faint)]">
          No candidates filed yet
        </div>
      )}
    </div>
  )
}

function ScorecardCandidateRow({
  candidate,
  scoreData,
}: {
  candidate: Candidate
  scoreData: { score: number; matched: number; total: number } | null
}) {
  const href = candidate.politician_id
    ? `/politicians/${candidate.politician_id}`
    : `/candidates/${candidate.id}`

  const hasData = scoreData && scoreData.matched > 0

  return (
    <Link
      href={href}
      className="block px-5 py-3 no-underline transition-colors hover:bg-[var(--codex-hover)]"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full"
          style={{ border: `2px solid ${partyColor(candidate.party)}33` }}
        >
          <AvatarImage
            src={candidate.image_url}
            alt={candidate.name}
            size={36}
            fallbackColor={partyColor(candidate.party)}
            party={candidate.party}
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-[var(--codex-text)]">
              {candidate.name}
            </span>
            {candidate.is_incumbent && (
              <span className="rounded-sm bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-[var(--codex-badge-text)]">
                Incumbent
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--codex-sub)]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: partyColor(candidate.party) }}
            />
            <span>{partyLabel(candidate.party)}</span>
          </div>
        </div>
      </div>

      {/* Alignment bar */}
      <div className="mt-2 pl-12">
        {hasData ? (
          <div>
            <AlignmentBar score={scoreData.score} size="sm" />
            <p className="mt-0.5 text-[10px] text-[var(--codex-faint)]">
              Based on {scoreData.matched} shared issue{scoreData.matched !== 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <p className="text-xs text-[var(--codex-faint)]">No stance data</p>
        )}
      </div>
    </Link>
  )
}
