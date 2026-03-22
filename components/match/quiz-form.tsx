'use client'

import { useState } from 'react'
import { IssueIcon } from '@/components/icons/issue-icon'
import { STANCE_STYLES } from '@/lib/utils/stances'
import { MatchResults } from './match-results'

interface Issue {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

interface MatchResult {
  politician: {
    name: string
    slug: string
    party: string
    state: string
    chamber: string
    image_url: string | null
    title: string | null
  }
  score: number
  matchedIssues: number
  totalIssues: number
}

/** Selectable stances in display order (excludes mixed/unknown) */
const QUIZ_STANCES = [
  'strongly_supports',
  'supports',
  'leans_support',
  'neutral',
  'leans_oppose',
  'opposes',
  'strongly_opposes',
] as const

interface Props {
  issues: Issue[]
}

export function QuizForm({ issues }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<MatchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const total = issues.length
  const issue = issues[currentStep]
  const isLast = currentStep === total - 1
  const progress = total > 0 ? ((currentStep + 1) / total) * 100 : 0

  function selectStance(stance: string) {
    setAnswers((prev) => ({ ...prev, [issue.slug]: stance }))
  }

  function skip() {
    // Remove any existing answer for this issue
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[issue.slug]
      return next
    })
    if (!isLast) setCurrentStep((s) => s + 1)
  }

  function goBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  function goNext() {
    if (!isLast) setCurrentStep((s) => s + 1)
  }

  async function submit() {
    // Filter to only answered stances (not skipped)
    const validStances: Record<string, string> = {}
    for (const [slug, stance] of Object.entries(answers)) {
      if (stance) validStances[slug] = stance
    }

    if (Object.keys(validStances).length < 3) {
      setError('Please answer at least 3 questions to get meaningful results.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stances: validStances }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setResults(data.results)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function retake() {
    setAnswers({})
    setCurrentStep(0)
    setResults(null)
    setError(null)
  }

  // Show results
  if (results) {
    return <MatchResults results={results} onRetake={retake} />
  }

  if (!issue) return null

  const selected = answers[issue.slug]

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[var(--codex-sub)]">
          <span>Question {currentStep + 1} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--codex-border)]">
          <div
            className="h-full rounded-full bg-[var(--codex-text)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Issue header */}
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-[var(--codex-sub)]">
          <IssueIcon icon={issue.icon} size={20} />
        </div>
        <h2 className="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold text-[var(--codex-text)]">
          {issue.name}
        </h2>
        {issue.description && (
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--codex-sub)]">
            {issue.description}
          </p>
        )}
      </div>

      {/* Stance buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2">
        {QUIZ_STANCES.map((stance) => {
          const style = STANCE_STYLES[stance]
          const isSelected = selected === stance
          return (
            <button
              key={stance}
              onClick={() => selectStance(stance)}
              className={`rounded-lg border px-4 py-2.5 text-[14px] font-medium transition-all sm:px-3 sm:py-2 ${
                isSelected
                  ? 'border-transparent text-white'
                  : 'border-[var(--codex-border)] text-[var(--codex-sub)] hover:border-[var(--codex-input-border)] hover:text-[var(--codex-text)]'
              }`}
              style={
                isSelected
                  ? { backgroundColor: style.color }
                  : undefined
              }
            >
              {style.label}
            </button>
          )
        })}
      </div>

      {/* Skip button */}
      <div className="mt-3 text-center">
        <button
          onClick={skip}
          className="text-[13px] text-[var(--codex-faint)] underline decoration-[var(--codex-border)] underline-offset-2 transition-colors hover:text-[var(--codex-sub)]"
        >
          Skip this question
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-center text-[13px] text-red-400">{error}</p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="rounded-lg border border-[var(--codex-border)] px-5 py-2.5 text-[14px] font-medium text-[var(--codex-sub)] transition-colors hover:bg-[var(--codex-hover)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          Back
        </button>

        {isLast ? (
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--codex-text)] px-6 py-2.5 text-[14px] font-semibold text-[var(--codex-card)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Finding matches...' : 'See My Matches'}
          </button>
        ) : (
          <button
            onClick={goNext}
            className="rounded-lg bg-[var(--codex-text)] px-5 py-2.5 text-[14px] font-semibold text-[var(--codex-card)] transition-opacity hover:opacity-90"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
