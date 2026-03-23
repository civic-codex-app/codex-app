'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { AvatarImage } from '@/components/ui/avatar-image'
import { alignmentMeta } from '@/lib/utils/alignment'
import { stanceStyle, stanceDisplayBadge } from '@/lib/utils/stances'
import { QUIZ_CONTENT } from '@/lib/data/quiz-content'
import { trackEvent } from '@/lib/utils/analytics'

interface Politician {
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  image_url: string | null
  title: string | null
  twitter_url?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  website_url?: string | null
}

interface IssueComparison {
  slug: string
  userStance: string
  polStance: string
  distance: number
}

interface MatchResult {
  politician: Politician
  score: number
  matchedIssues: number
  totalIssues: number
  issueBreakdown?: IssueComparison[]
}

interface Props {
  results: MatchResult[]
  stateResults?: MatchResult[]
  acrossTheAisle?: MatchResult[]
  surprises?: MatchResult[]
  userParty?: string | null
  userState?: string | null
  isLoggedIn?: boolean
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

function issueLabel(slug: string): string {
  return QUIZ_CONTENT[slug]?.question?.replace(/\?.*/, '') ?? slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

function IssueBreakdown({ issues, politicianParty }: { issues: IssueComparison[]; politicianParty?: string }) {
  const agree = issues.filter(i => i.distance <= 1)
  const close = issues.filter(i => i.distance === 2)
  const differ = issues.filter(i => i.distance >= 3)

  return (
    <div className="mt-3 space-y-3 border-t border-[var(--codex-border)] pt-3">
      {agree.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Agree ({agree.length})
          </div>
          {agree.map(i => (
            <IssueRow key={i.slug} issue={i} politicianParty={politicianParty} />
          ))}
        </div>
      )}
      {close.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-amber-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Close ({close.length})
          </div>
          {close.map(i => (
            <IssueRow key={i.slug} issue={i} politicianParty={politicianParty} />
          ))}
        </div>
      )}
      {differ.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-red-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Differ ({differ.length})
          </div>
          {differ.map(i => (
            <IssueRow key={i.slug} issue={i} politicianParty={politicianParty} />
          ))}
        </div>
      )}
    </div>
  )
}

function IssueRow({ issue, politicianParty }: { issue: IssueComparison; politicianParty?: string }) {
  const userBadge = stanceDisplayBadge(issue.userStance)
  const polBadge = stanceDisplayBadge(issue.polStance, politicianParty)
  return (
    <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[12px]">
      <span className="min-w-0 flex-1 truncate text-[var(--codex-sub)]">{issueLabel(issue.slug)}</span>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium border" style={userBadge.style}>
          You: {userBadge.label}
        </span>
        <span className="text-[var(--codex-faint)]">vs</span>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium border" style={polBadge.style}>
          {polBadge.label}
        </span>
      </div>
    </div>
  )
}

export function MatchResults({ results, stateResults = [], acrossTheAisle = [], surprises = [], userParty, userState, isLoggedIn, onRetake, onEditAnswers, onUpdateResults }: Props) {
  const [copied, setCopied] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  function toggleExpand(slug: string) {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  // Track result view on mount
  useEffect(() => {
    if (results.length > 0) {
      trackEvent('quiz_result_viewed', {
        topMatch: results[0].politician.slug,
        topScore: results[0].score,
        totalResults: results.length,
        isLoggedIn: isLoggedIn ?? false,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleShare = useCallback(() => {
    const top = results[0]
    if (!top) return

    const shareUrl = `${window.location.origin}/quiz?result=${top.politician.slug}&score=${top.score}`

    const canShare = typeof navigator.share === 'function'
    trackEvent('quiz_results_shared', { method: canShare ? 'native' : 'clipboard', topMatch: top.politician.slug })
    if (canShare) {
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

  const topSlug = results[0]?.politician.slug

  // Get top match from each party for hero cards, then fill to at least 3
  const seenParties = new Set<string>()
  const partyBests: MatchResult[] = []
  for (const r of results) {
    if (!seenParties.has(r.politician.party)) {
      partyBests.push(r)
      seenParties.add(r.politician.party)
    }
  }
  // Fill up to at least 3 hero cards from top results
  const heroSlugs = new Set(partyBests.map(r => r.politician.slug))
  for (const r of results) {
    if (partyBests.length >= 3) break
    if (!heroSlugs.has(r.politician.slug)) {
      partyBests.push(r)
      heroSlugs.add(r.politician.slug)
    }
  }
  // Sort hero cards: best score first
  partyBests.sort((a, b) => b.score - a.score)

  // Remaining results
  const rest = results.filter(r => !heroSlugs.has(r.politician.slug))

  // Party breakdown summary
  const partyCounts: Record<string, number> = {}
  for (const r of results) {
    const p = r.politician.party
    partyCounts[p] = (partyCounts[p] ?? 0) + 1
  }
  const partyEntries = Object.entries(partyCounts).sort((a, b) => b[1] - a[1])

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
      <p className="mb-4 text-center text-[14px] text-[var(--codex-sub)]">
        Based on {results[0]?.matchedIssues ?? 0} issues you answered
      </p>

      {/* Party breakdown summary */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {partyEntries.map(([party, count]) => (
          <div
            key={party}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
            style={{ backgroundColor: `${partyColor(party)}15`, color: partyColor(party) }}
          >
            <PartyIcon party={party} size={12} />
            <span>{count} {partyLabel(party)}{count !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>

      {/* Top match from each party */}
      <div className="mb-8 flex flex-col gap-4">
        {partyBests.map((r, i) => {
          const color = scoreColor(r.score)
          const pColor = partyColor(r.politician.party)
          const isExpanded = expandedCards.has(r.politician.slug)
          const hasBreakdown = r.issueBreakdown && r.issueBreakdown.length > 0
          return (
            <div
              key={r.politician.slug}
              className="rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)] p-5"
            >
              <div className="flex items-center gap-4">
                {/* Party badge */}
                <span
                  className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: `${pColor}15`, color: pColor }}
                >
                  <PartyIcon party={r.politician.party} size={12} />
                  #{i + 1}
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
                <div className="flex items-center gap-3">
                  <span>{r.matchedIssues} issues compared</span>
                  {hasBreakdown && (
                    <button
                      onClick={() => toggleExpand(r.politician.slug)}
                      className="font-medium text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {isExpanded ? 'Hide breakdown' : 'See issue breakdown'}
                    </button>
                  )}
                </div>
                <Link
                  href={`/compare?a=${topSlug}&b=${r.politician.slug}`}
                  className="text-[var(--codex-sub)] hover:text-[var(--codex-text)] hover:underline"
                >
                  Compare
                </Link>
              </div>

              {/* Expandable issue breakdown */}
              {isExpanded && hasBreakdown && (
                <IssueBreakdown issues={r.issueBreakdown!} politicianParty={r.politician.party} />
              )}

              {/* Social links + View Profile */}
              <div className="mt-3 flex items-center gap-2 border-t border-[var(--codex-border)] pt-3">
                {r.politician.twitter_url && (
                  <a href={r.politician.twitter_url} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--codex-faint)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]" title="X / Twitter">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {r.politician.facebook_url && (
                  <a href={r.politician.facebook_url} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--codex-faint)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]" title="Facebook">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {r.politician.instagram_url && (
                  <a href={r.politician.instagram_url} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--codex-faint)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]" title="Instagram">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {r.politician.website_url && (
                  <a href={r.politician.website_url} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--codex-faint)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]" title="Website">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </a>
                )}
                <Link
                  href={`/politicians/${r.politician.slug}`}
                  className="ml-auto rounded-md border border-[var(--codex-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--codex-sub)] no-underline transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sign-up CTA — prominent placement after top 3 */}
      {!isLoggedIn && (
        <div className="mb-10 overflow-hidden rounded-xl border border-[var(--codex-border)]" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))' }}>
          <div className="px-6 py-8 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Don't lose your results
            </p>
            <p className="mt-2 text-[clamp(1.1rem,2.5vw,1.4rem)] font-bold text-[var(--codex-text)]">
              Create an account to save your matches
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--codex-sub)]">
              See which politicians represent your state, track issues you care about, and keep your results across devices.
            </p>
            <Link
              href="/signup"
              onClick={() => trackEvent('quiz_cta_signup_clicked', { topMatch: results[0]?.politician.slug ?? '' })}
              className="mt-5 inline-block rounded-lg px-8 py-3 text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
            >
              Sign Up Free
            </Link>
            <p className="mt-3">
              <Link
                href="/login"
                className="text-[13px] text-[var(--codex-sub)] underline decoration-[var(--codex-border)] underline-offset-2 hover:text-[var(--codex-text)]"
              >
                Already have an account? Sign in
              </Link>
            </p>
          </div>
        </div>
      )}

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
                    {i + 1}
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

      {/* Across the Aisle — cross-party matches */}
      {acrossTheAisle.length > 0 && (
        <div className="mb-10">
          <h3 className="mb-1 text-sm font-semibold text-[var(--codex-text)]">
            Across the Aisle
          </h3>
          <p className="mb-3 text-[12px] text-[var(--codex-faint)]">
            Politicians from other parties who still share some of your views
          </p>
          <div className="divide-y divide-[var(--codex-border)] rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)]">
            {acrossTheAisle.map((r) => {
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
                      <span>{r.politician.state}</span>
                    </div>
                  </div>
                  <div className="flex w-24 shrink-0 items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
                      <div className="h-full rounded-full" style={{ width: `${r.score}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{r.score}%</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Might Surprise You — lowest from your closest party */}
      {surprises.length > 0 && userParty && (
        <div className="mb-10">
          <h3 className="mb-1 text-sm font-semibold text-[var(--codex-text)]">
            Might Surprise You
          </h3>
          <p className="mb-3 text-[12px] text-[var(--codex-faint)]">
            {partyLabel(userParty)} politicians you align with the least
          </p>
          <div className="divide-y divide-[var(--codex-border)] rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)]">
            {surprises.map((r) => {
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
                      <span>{r.politician.state}</span>
                    </div>
                  </div>
                  <div className="flex w-24 shrink-0 items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
                      <div className="h-full rounded-full" style={{ width: `${r.score}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{r.score}%</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
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
      </div>
    </div>
  )
}
