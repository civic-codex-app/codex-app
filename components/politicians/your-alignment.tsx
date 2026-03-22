'use client'

import { useEffect, useState } from 'react'
import { loadQuizAnswers, loadQuizFromServer, mergeQuizAnswers, clearQuizProgress } from '@/lib/utils/quiz-storage'
import Link from 'next/link'

interface Stance {
  issue_slug: string
  stance: string
  is_verified?: boolean
}

interface Props {
  politicianName: string
  politicianSlug: string
  politicianStances: Stance[]
}

/**
 * Distance-decay scoring — same algorithm as the match API.
 * Verified stances get full weight (1.0x), estimated stances get 0.5x
 * so politicians with real positions rank higher than party defaults.
 */
function computeScore(userAnswers: Record<string, string>, politicianStances: Stance[]): { score: number; matched: number } {
  const NUMERIC: Record<string, number> = {
    strongly_supports: 6, supports: 5, leans_support: 4,
    neutral: 3, mixed: 3,
    leans_oppose: 2, opposes: 1, strongly_opposes: 0,
  }

  const VERIFIED_WEIGHT = 1.0
  const ESTIMATED_WEIGHT = 0.5

  let weightedSum = 0
  let totalWeight = 0
  let matched = 0

  for (const ps of politicianStances) {
    const userStance = userAnswers[ps.issue_slug]
    if (!userStance) continue
    const uVal = NUMERIC[userStance]
    const pVal = NUMERIC[ps.stance]
    if (uVal === undefined || pVal === undefined) continue

    matched++
    const distance = Math.abs(uVal - pVal)
    const similarity = distance === 0 ? 1.0 : distance === 1 ? 0.85 : distance === 2 ? 0.55 : distance === 3 ? 0.25 : 0.0

    const vWeight = ps.is_verified ? VERIFIED_WEIGHT : ESTIMATED_WEIGHT
    weightedSum += similarity * vWeight
    totalWeight += vWeight
  }

  if (matched === 0 || totalWeight === 0) return { score: 0, matched: 0 }
  return { score: Math.round((weightedSum / totalWeight) * 100), matched }
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
  return 'Very different'
}

export function YourAlignment({ politicianName, politicianSlug, politicianStances }: Props) {
  const [result, setResult] = useState<{ score: number; matched: number } | null>(null)
  const [hasQuiz, setHasQuiz] = useState(false)

  useEffect(() => {
    async function load() {
      const local = loadQuizAnswers()
      const server = await loadQuizFromServer()
      const answers = mergeQuizAnswers(local, server)
      const count = Object.keys(answers).length
      if (count < 3) return

      setHasQuiz(true)

      const stances = politicianStances.map(s => ({
      issue_slug: s.issue_slug,
      stance: s.stance,
    }))

    const computed = computeScore(answers, stances)
    if (computed.matched >= 3) {
      setResult(computed)
    }
    }
    load()
  }, [politicianStances])

  // Not enough quiz data
  if (!hasQuiz) return null

  // Quiz taken but not enough overlap with this politician
  if (!result) return null

  const color = scoreColor(result.score)

  return (
    <div className="rounded-xl border-2 p-4" style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
      <div className="flex items-center gap-4">
        {/* Score circle */}
        <div className="relative flex-shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--codex-border)" strokeWidth="3" />
            <circle
              cx="28" cy="28" r="24" fill="none"
              stroke={color} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(result.score / 100) * 150.8} 150.8`}
              transform="rotate(-90 28 28)"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold" style={{ color }}>
            {result.score}%
          </span>
        </div>

        <div className="flex-1">
          <div className="text-[14px] font-semibold text-[var(--codex-text)]">
            Your alignment with {politicianName.split(' ').pop()}
          </div>
          <div className="mt-0.5 text-[12px]" style={{ color }}>
            {scoreLabel(result.score)} · Based on {result.matched} shared issues
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/compare?a=${politicianSlug}`}
          className="flex-1 rounded-lg border border-[var(--codex-border)] py-2 text-center text-[12px] font-medium text-[var(--codex-sub)] no-underline transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]"
        >
          Compare
        </Link>
        <Link
          href="/quiz"
          className="flex-1 rounded-lg border border-[var(--codex-border)] py-2 text-center text-[12px] font-medium text-[var(--codex-sub)] no-underline transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]"
        >
          See All Results
        </Link>
        <Link
          href="/quiz"
          onClick={() => { try { clearQuizProgress() } catch {} }}
          className="flex-1 rounded-lg border border-[var(--codex-border)] py-2 text-center text-[12px] font-medium text-[var(--codex-faint)] no-underline transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-sub)]"
        >
          Retake
        </Link>
      </div>
    </div>
  )
}
