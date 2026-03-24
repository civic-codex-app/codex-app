'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IssueIcon } from '@/components/icons/issue-icon'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor } from '@/lib/constants/parties'
import { stanceStyle, stanceBucket, stanceDisplayBadge } from '@/lib/utils/stances'

/* ── Hardcoded issue metadata (same as onboarding) ─────────────── */
const ISSUE_META: Record<string, { name: string; icon: string }> = {
  economy: { name: 'Economy', icon: 'briefcase' },
  healthcare: { name: 'Healthcare', icon: 'heart-pulse' },
  immigration: { name: 'Immigration', icon: 'globe' },
  education: { name: 'Education', icon: 'graduation-cap' },
  defense: { name: 'Defense', icon: 'shield' },
  environment: { name: 'Environment', icon: 'leaf' },
  'criminal-justice': { name: 'Criminal Justice', icon: 'scale' },
  'foreign-policy': { name: 'Foreign Policy', icon: 'landmark' },
  technology: { name: 'Technology', icon: 'cpu' },
  'social-issues': { name: 'Social Issues', icon: 'users' },
  'gun-policy': { name: 'Gun Policy', icon: 'target' },
  infrastructure: { name: 'Infrastructure', icon: 'hard-hat' },
  housing: { name: 'Housing', icon: 'home' },
  energy: { name: 'Energy', icon: 'zap' },
}

/* ── Types ────────────────────────────────────────────────────────── */
interface Rep {
  id: string
  name: string
  slug: string
  party: string
  image_url: string | null
  chamber: string
}

interface RepStance {
  politician_id: string
  issue_slug: string
  stance: string
}

interface IssuePrioritiesProps {
  zip: string | null
}

/* ── Component ────────────────────────────────────────────────────── */
export function IssuePriorities({ zip }: IssuePrioritiesProps) {
  const [topIssues, setTopIssues] = useState<string[]>([])
  const [reps, setReps] = useState<Rep[]>([])
  const [stances, setStances] = useState<RepStance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Read saved issues from localStorage
    try {
      const saved = localStorage.getItem('poli_top_issues')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTopIssues(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    if (!zip || topIssues.length === 0) {
      setLoading(false)
      return
    }

    async function fetchData() {
      setLoading(true)
      setError('')

      try {
        // Fetch representatives
        const repRes = await fetch(`/api/representatives?zip=${zip}`)
        if (!repRes.ok) throw new Error('Failed to load representatives')
        const repData = await repRes.json()
        const representatives: Rep[] = repData.representatives ?? []
        setReps(representatives)

        if (representatives.length === 0) {
          setLoading(false)
          return
        }

        // Fetch stances for these reps on the user's top issues
        // We use the search API or direct Supabase call via a lightweight endpoint
        // For now, fetch from /api/representatives/stances
        const repIds = representatives.map((r) => r.id)
        const stanceRes = await fetch('/api/representatives/stances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ politician_ids: repIds, issue_slugs: topIssues }),
        })

        if (stanceRes.ok) {
          const stanceData = await stanceRes.json()
          setStances(stanceData.stances ?? [])
        }
      } catch (err) {
        setError('Could not load representative stances.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [zip, topIssues])

  // No saved issues
  if (!loading && topIssues.length === 0) {
    return (
      <div className="rounded-md border border-[var(--poli-border)] py-8 text-center">
        <p className="mb-2 text-sm text-[var(--poli-sub)]">
          No priority issues set
        </p>
        <p className="mb-4 text-xs text-[var(--poli-faint)]">
          Complete onboarding to select your top issues
        </p>
        <Link
          href="/onboarding"
          className="rounded-md bg-[var(--poli-badge-bg)] px-4 py-2 text-sm text-[var(--poli-text)] no-underline hover:bg-[var(--poli-hover)]"
        >
          Set priorities
        </Link>
      </div>
    )
  }

  // No zip code
  if (!loading && !zip) {
    return (
      <div className="rounded-md border border-[var(--poli-border)] py-8 text-center">
        <p className="mb-2 text-sm text-[var(--poli-sub)]">
          Set your zip code to see how your reps stand on your issues
        </p>
        <Link
          href="/account"
          className="rounded-md bg-[var(--poli-badge-bg)] px-4 py-2 text-sm text-[var(--poli-text)] no-underline hover:bg-[var(--poli-hover)]"
        >
          Update profile
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-md border border-[var(--poli-border)] py-8 text-center">
        <p className="text-sm text-[var(--poli-faint)]">Loading issue priorities...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    )
  }

  // Build a lookup: issueSlug -> { rep, stance }[]
  const stanceMap = new Map<string, Map<string, string>>()
  for (const s of stances) {
    if (!stanceMap.has(s.issue_slug)) stanceMap.set(s.issue_slug, new Map())
    stanceMap.get(s.issue_slug)!.set(s.politician_id, s.stance)
  }

  return (
    <div className="space-y-3">
      {topIssues.map((slug) => {
        const meta = ISSUE_META[slug]
        if (!meta) return null

        const issueStances = stanceMap.get(slug)

        return (
          <div
            key={slug}
            className="rounded-md border border-[var(--poli-border)] px-4 py-3"
          >
            {/* Issue header */}
            <div className="mb-2 flex items-center gap-2">
              <IssueIcon
                icon={meta.icon}
                className="h-4 w-4 text-[var(--poli-sub)]"
              />
              <Link
                href={`/issues/${slug}`}
                className="text-sm font-medium text-[var(--poli-text)] no-underline hover:underline"
              >
                {meta.name}
              </Link>
            </div>

            {/* Rep stances */}
            {reps.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reps.map((rep) => {
                  const stance = issueStances?.get(rep.id)
                  const badge = stance ? stanceDisplayBadge(stance, rep.party) : null
                  const style = stance ? stanceStyle(stance) : null
                  const bucket = stance ? stanceBucket(stance) : 'unknown'

                  return (
                    <Link
                      key={rep.id}
                      href={`/politicians/${rep.slug}`}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--poli-border)] py-1 pl-1 pr-2.5 no-underline transition-colors hover:bg-[var(--poli-hover)]"
                      title={`${rep.name}: ${style?.label ?? 'No stance recorded'}`}
                    >
                      <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded-full">
                        <AvatarImage
                          src={rep.image_url}
                          alt={rep.name}
                          size={20}
                          fallbackColor={partyColor(rep.party)}
                          party={rep.party}
                        />
                      </div>
                      {badge ? (
                        <span
                          className="rounded px-1.5 py-0.5 text-[11px] font-medium border"
                          style={badge.style}
                        >
                          {badge.label}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--poli-faint)]">
                          No stance
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--poli-faint)]">
                No representatives found for your area
              </p>
            )}
          </div>
        )
      })}

      {/* Edit link */}
      <div className="pt-1 text-center">
        <Link
          href="/onboarding"
          className="text-xs text-[var(--poli-faint)] hover:text-[var(--poli-text)]"
        >
          Edit priorities &rarr;
        </Link>
      </div>
    </div>
  )
}
