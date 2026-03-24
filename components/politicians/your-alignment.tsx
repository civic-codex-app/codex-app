'use client'

import { useEffect, useState } from 'react'
import { loadQuizAnswers, loadQuizFromServer, mergeQuizAnswers } from '@/lib/utils/quiz-storage'
import { STANCE_STYLES, stanceDisplayBadge } from '@/lib/utils/stances'

interface Stance {
  issue_slug: string
  issue_name?: string
  stance: string
  is_verified?: boolean
}

interface Props {
  politicianName: string
  politicianSlug: string
  politicianStances: Stance[]
  politicianParty?: string
}

const NUMERIC: Record<string, number> = {
  strongly_supports: 6, supports: 5, leans_support: 4,
  neutral: 3, mixed: 3,
  leans_oppose: 2, opposes: 1, strongly_opposes: 0,
}

interface IssueComparison {
  slug: string
  name: string
  userStance: string
  polStance: string
  distance: number // 0-6
  agree: boolean   // distance <= 1
}

function computeComparisons(userAnswers: Record<string, string>, politicianStances: Stance[]): { score: number; issues: IssueComparison[] } {
  const issues: IssueComparison[] = []
  let weightedSum = 0
  let totalWeight = 0

  for (const ps of politicianStances) {
    const userStance = userAnswers[ps.issue_slug]
    if (!userStance) continue
    const uVal = NUMERIC[userStance]
    const pVal = NUMERIC[ps.stance]
    if (uVal === undefined || pVal === undefined) continue

    const distance = Math.abs(uVal - pVal)
    const similarity = distance === 0 ? 1.0 : distance === 1 ? 0.85 : distance === 2 ? 0.55 : distance === 3 ? 0.25 : 0.0
    const vWeight = ps.is_verified ? 1.0 : 0.5

    weightedSum += similarity * vWeight
    totalWeight += vWeight

    issues.push({
      slug: ps.issue_slug,
      name: ps.issue_name || ps.issue_slug.replace(/-and-/g, ' & ').replace(/-/g, ' '),
      userStance,
      polStance: ps.stance,
      distance,
      agree: distance <= 1,
    })
  }

  const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0
  // Sort: agreements first, then disagreements, both by distance
  issues.sort((a, b) => {
    if (a.agree !== b.agree) return a.agree ? -1 : 1
    return a.distance - b.distance
  })

  return { score, issues }
}

function scoreColor(score: number): string {
  if (score >= 75) return '#3B82F6'
  if (score >= 50) return '#A855F7'
  if (score >= 25) return '#F97316'
  return '#EF4444'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Very aligned'
  if (score >= 60) return 'Mostly aligned'
  if (score >= 40) return 'Somewhat aligned'
  if (score >= 20) return 'Not very aligned'
  return 'Very different views'
}

export function YourAlignment({ politicianName, politicianStances, politicianParty }: Props) {
  const [data, setData] = useState<{ score: number; issues: IssueComparison[] } | null>(null)

  useEffect(() => {
    async function load() {
      const local = loadQuizAnswers()
      const server = await loadQuizFromServer()
      const answers = mergeQuizAnswers(local, server)
      if (Object.keys(answers).length < 3) return

      const result = computeComparisons(answers, politicianStances)
      if (result.issues.length >= 3) setData(result)
    }
    load()
  }, [politicianStances])

  if (!data) return null

  const color = scoreColor(data.score)
  const agrees = data.issues.filter(i => i.agree)
  const disagrees = data.issues.filter(i => !i.agree)
  const lastName = politicianName.split(' ').pop()

  return (
    <div className="rounded-xl border border-[var(--poli-border)] overflow-hidden">
      {/* Header with score */}
      <div className="flex items-center gap-4 p-4" style={{ backgroundColor: `${color}08` }}>
        <div className="relative flex-shrink-0">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="var(--poli-border)" strokeWidth="3" />
            <circle
              cx="26" cy="26" r="22" fill="none"
              stroke={color} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(data.score / 100) * 138.2} 138.2`}
              transform="rotate(-90 26 26)"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold" style={{ color }}>
            {data.score}%
          </span>
        </div>
        <div>
          <div className="text-[14px] font-semibold text-[var(--poli-text)]">
            You &amp; {lastName}
          </div>
          <div className="text-[12px]" style={{ color }}>
            {scoreLabel(data.score)}
          </div>
        </div>
      </div>

      {/* Issue breakdown */}
      <div className="divide-y divide-[var(--poli-border)]">
        {/* Agreements */}
        {agrees.length > 0 && (
          <div className="px-4 py-3">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-blue-400">
              Agree on {agrees.length} issue{agrees.length !== 1 ? 's' : ''}
            </div>
            <div className="space-y-1.5">
              {agrees.map(issue => {
                const userBadge = stanceDisplayBadge(issue.userStance)
                return (
                  <div key={issue.slug} className="flex items-center justify-between text-[12px]">
                    <span className="capitalize text-[var(--poli-sub)]">{issue.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-medium border" style={userBadge.style}>
                        {userBadge.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Disagreements */}
        {disagrees.length > 0 && (
          <div className="px-4 py-3">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-red-400">
              Differ on {disagrees.length} issue{disagrees.length !== 1 ? 's' : ''}
            </div>
            <div className="space-y-1.5">
              {disagrees.map(issue => {
                const userBadge = stanceDisplayBadge(issue.userStance)
                const polBadge = stanceDisplayBadge(issue.polStance, politicianParty)
                return (
                  <div key={issue.slug} className="flex items-center justify-between text-[12px]">
                    <span className="capitalize text-[var(--poli-sub)]">{issue.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-medium border" style={userBadge.style}>
                        You
                      </span>
                      <span className="text-[var(--poli-faint)]">vs</span>
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-medium border" style={polBadge.style}>
                        {lastName}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
