'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { AvatarImage } from '@/components/ui/avatar-image'
import { alignmentMeta } from '@/lib/utils/alignment'

interface Politician {
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  image_url: string | null
  title: string | null
}

interface MatchResult {
  politician: Politician
  score: number
  matchedIssues: number
  totalIssues: number
}

interface Props {
  results: MatchResult[]
  stateResults?: MatchResult[]
  userState?: string | null
  onRetake: () => void
  onEditAnswers?: () => void
  onUpdateResults?: () => void
}

function scoreColor(score: number): string {
  if (score >= 75) return '#22C55E'
  if (score >= 50) return '#3B82F6'
  if (score >= 25) return '#EAB308'
  return '#EF4444'
}

export function MatchResults({ results, stateResults = [], userState, onRetake, onEditAnswers, onUpdateResults }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    const top = results[0]
    if (!top) return

    const shareUrl = `${window.location.origin}/quiz?result=${top.politician.slug}&score=${top.score}`

    if (navigator.share) {
      navigator.share({
        title: `I'm ${top.score}% aligned with ${top.politician.name}`,
        text: 'Take the Who Represents You quiz on Poli!',
        url: shareUrl,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {})
    }
  }, [results])

  if (results.length === 0) {
    return (
      <div className="text-center">
        <p className="text-[var(--codex-sub)]">
          No results found. Try answering more questions for better results.
        </p>
        <button
          onClick={onRetake}
          className="mt-6 rounded-lg bg-[var(--codex-text)] px-6 py-2.5 text-[14px] font-semibold text-[var(--codex-card)] transition-opacity hover:opacity-90"
        >
          Retake Quiz
        </button>
      </div>
    )
  }

  const topThree = results.slice(0, 3)
  const rest = results.slice(3)
  const topSlug = results[0]?.politician.slug

  return (
    <div>
      {/* State-specific results */}
      {stateResults.length > 0 && userState && (
        <div className="mb-10">
          <h2 className="mb-2 text-center text-[clamp(1.1rem,2.5vw,1.4rem)] font-bold text-[var(--codex-text)]">
            Who Thinks Like You in {userState}
          </h2>
          <p className="mb-5 text-center text-[13px] text-[var(--codex-sub)]">
            These are officials who represent your state
          </p>
          <div className="divide-y divide-[var(--codex-border)] rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)]">
            {stateResults.map((r) => {
              const color = scoreColor(r.score)
              const pColor = partyColor(r.politician.party)
              return (
                <Link key={r.politician.slug} href={`/politicians/${r.politician.slug}`} className="flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-[var(--codex-hover)]">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: pColor }}>
                    <AvatarImage src={r.politician.image_url} alt={r.politician.name} size={36} fallbackColor={pColor} party={r.politician.party} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[14px] font-medium text-[var(--codex-text)]">{r.politician.name}</span>
                    <div className="flex items-center gap-1 text-[12px] text-[var(--codex-faint)]">
                      <PartyIcon party={r.politician.party} size={10} />
                      <span>{partyLabel(r.politician.party)}</span>
                      <span>·</span>
                      <span>{r.politician.chamber}</span>
                    </div>
                  </div>
                  <span className="text-[14px] font-semibold tabular-nums" style={{ color }}>{r.score}%</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <h2 className="mb-2 text-center text-[clamp(1.25rem,3vw,1.75rem)] font-bold text-[var(--codex-text)]">
        Across the Country
      </h2>
      <p className="mb-8 text-center text-[14px] text-[var(--codex-sub)]">
        Based on {results[0]?.matchedIssues ?? 0} issues you answered
      </p>

      {/* Podium: top 3 */}
      <div className="mb-8 flex flex-col gap-4">
        {topThree.map((r, i) => {
          const color = scoreColor(r.score)
          const pColor = partyColor(r.politician.party)
          const meta = alignmentMeta(r.score)
          return (
            <div
              key={r.politician.slug}
              className="rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)] p-5"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-bold"
                  style={{ backgroundColor: `${color}18`, color }}
                >
                  {i + 1}
                </span>

                {/* Avatar */}
                <div
                  className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2"
                  style={{ borderColor: pColor }}
                >
                  <AvatarImage
                    src={r.politician.image_url}
                    alt={r.politician.name}
                    size={56}
                    fallbackColor={pColor}
                    party={r.politician.party}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/politicians/${r.politician.slug}`}
                    className="text-[17px] font-semibold text-[var(--codex-text)] hover:underline"
                  >
                    {r.politician.name}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[var(--codex-sub)]">
                    <PartyIcon party={r.politician.party} size={12} />
                    <span>{partyLabel(r.politician.party)}</span>
                    <span className="text-[var(--codex-faint)]">·</span>
                    <span>{r.politician.state}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  <span
                    className="text-[28px] font-bold leading-none"
                    style={{ color }}
                  >
                    {r.score}
                  </span>
                  <span
                    className="ml-0.5 text-[13px] font-medium"
                    style={{ color }}
                  >
                    %
                  </span>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--codex-border)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${r.score}%`, backgroundColor: color }}
                />
              </div>

              {/* Meta row */}
              <div className="mt-2.5 flex items-center justify-between text-[12px] text-[var(--codex-faint)]">
                <span>{r.matchedIssues} issues matched</span>
                <Link
                  href={`/compare?a=${topSlug}&b=${r.politician.slug}`}
                  className="text-[var(--codex-sub)] hover:text-[var(--codex-text)] hover:underline"
                >
                  Compare
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Remaining results */}
      {rest.length > 0 && (
        <>
          <h3 className="mb-3 text-sm font-semibold text-[var(--codex-sub)]">
            More Results
          </h3>
          <div className="divide-y divide-[var(--codex-border)] rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)]">
            {rest.map((r, i) => {
              const color = scoreColor(r.score)
              const pColor = partyColor(r.politician.party)
              return (
                <Link key={r.politician.slug} href={`/politicians/${r.politician.slug}`} className="flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-[var(--codex-hover)]">
                  {/* Rank */}
                  <span className="w-5 shrink-0 text-center text-[13px] font-medium text-[var(--codex-faint)]">
                    {i + 4}
                  </span>

                  {/* Avatar */}
                  <div
                    className="h-9 w-9 shrink-0 overflow-hidden rounded-full border"
                    style={{ borderColor: pColor }}
                  >
                    <AvatarImage
                      src={r.politician.image_url}
                      alt={r.politician.name}
                      size={36}
                      fallbackColor={pColor}
                      party={r.politician.party}
                    />
                  </div>

                  {/* Name + party */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[14px] font-medium text-[var(--codex-text)]">
                      {r.politician.name}
                    </span>
                    <div className="flex items-center gap-1 text-[12px] text-[var(--codex-faint)]">
                      <PartyIcon party={r.politician.party} size={10} />
                      <span>{partyLabel(r.politician.party)}</span>
                      <span>·</span>
                      <span>{r.politician.state}</span>
                    </div>
                  </div>

                  {/* Score bar + number */}
                  <div className="flex w-24 shrink-0 items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${r.score}%`, backgroundColor: color }}
                      />
                    </div>
                    <span
                      className="text-[13px] font-semibold tabular-nums"
                      style={{ color }}
                    >
                      {r.score}%
                    </span>
                  </div>

                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {onEditAnswers && (
          <button
            onClick={onEditAnswers}
            className="rounded-lg border border-[var(--codex-border)] px-5 py-2.5 text-[14px] font-medium text-[var(--codex-sub)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]"
          >
            Change Answers
          </button>
        )}
        {onUpdateResults && (
          <button
            onClick={onUpdateResults}
            className="rounded-lg border border-[var(--codex-border)] px-5 py-2.5 text-[14px] font-medium text-[var(--codex-sub)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]"
          >
            Update Results
          </button>
        )}
        <button
          onClick={onRetake}
          className="rounded-lg border border-[var(--codex-border)] px-5 py-2.5 text-[14px] font-medium text-[var(--codex-faint)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-sub)]"
        >
          Start Over
        </button>
        <button
          onClick={handleShare}
          className="rounded-lg bg-[var(--codex-text)] px-5 py-2.5 text-[14px] font-medium text-[var(--codex-card)] transition-opacity hover:opacity-90"
        >
          {copied ? 'Copied!' : 'Share Results'}
        </button>
      </div>
    </div>
  )
}
