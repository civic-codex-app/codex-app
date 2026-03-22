'use client'

import { useState, useCallback } from 'react'
import { IssueIcon } from '@/components/icons/issue-icon'
import { STANCE_STYLES } from '@/lib/utils/stances'
import { MatchResults } from './match-results'
import { QUIZ_CONTENT } from '@/lib/data/quiz-content'

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

/** Stances mapped to slider positions 0-6 */
const SLIDER_STANCES = [
  'strongly_supports',
  'supports',
  'leans_support',
  'neutral',
  'leans_oppose',
  'opposes',
  'strongly_opposes',
] as const

const SLIDER_LABELS = [
  'Strongly\nFor',
  'For',
  'Lean\nFor',
  'Neutral',
  'Lean\nAgainst',
  'Against',
  'Strongly\nAgainst',
]

interface Props {
  issues: Issue[]
}

export function QuizForm({ issues }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<MatchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sliderValue, setSliderValue] = useState<number>(3)

  const total = issues.length
  const issue = issues[currentStep]
  const isLast = currentStep === total - 1
  const progress = total > 0 ? ((currentStep + 1) / total) * 100 : 0

  const selectStance = useCallback((position: number) => {
    setSliderValue(position)
    setAnswers((prev) => ({ ...prev, [issue.slug]: SLIDER_STANCES[position] }))
  }, [issue?.slug])

  function skip() {
    goNext()
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      const prevIssue = issues[currentStep - 1]
      const prevAnswer = answers[prevIssue.slug]
      const idx = prevAnswer ? SLIDER_STANCES.indexOf(prevAnswer as any) : -1
      setSliderValue(idx >= 0 ? idx : 3)
    }
  }

  function goNext() {
    if (currentStep < total - 1) {
      setCurrentStep(currentStep + 1)
      const nextIssue = issues[currentStep + 1]
      const nextAnswer = answers[nextIssue.slug]
      const idx = nextAnswer ? SLIDER_STANCES.indexOf(nextAnswer as any) : -1
      setSliderValue(idx >= 0 ? idx : 3)
    }
  }

  async function submit() {
    const validStances: Record<string, string> = {}
    for (const [slug, stance] of Object.entries(answers)) {
      if (stance) validStances[slug] = stance
    }

    if (Object.keys(validStances).length < 3) {
      setError('Please answer at least 3 questions to get results.')
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
    setSliderValue(3)
  }

  if (results) {
    return <MatchResults results={results} onRetake={retake} />
  }

  if (!issue) return null

  const content = QUIZ_CONTENT[issue.slug]
  const currentStance = SLIDER_STANCES[sliderValue]
  const currentStyle = currentStance ? STANCE_STYLES[currentStance] : null

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
      <div className="mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-[var(--codex-sub)]">
          <IssueIcon icon={issue.icon} size={20} />
          <span className="text-[12px] font-medium uppercase tracking-[0.15em]">
            {issue.name}
          </span>
        </div>
        <h2 className="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold text-[var(--codex-text)]">
          {content?.question ?? issue.name}
        </h2>
        {content?.whyItMatters && (
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-[var(--codex-sub)]">
            {content.whyItMatters}
          </p>
        )}
      </div>

      {/* Examples cards */}
      {content && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-green-500">
              For looks like
            </div>
            <p className="text-[13px] leading-[1.5] text-[var(--codex-sub)]">
              {content.supportsMeans}
            </p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-500">
              Against looks like
            </div>
            <p className="text-[13px] leading-[1.5] text-[var(--codex-sub)]">
              {content.opposesMeans}
            </p>
          </div>
        </div>
      )}

      {/* Slider */}
      <div className="mx-auto max-w-lg">
        {/* Current selection label */}
        <div className="mb-4 flex h-10 items-center justify-center">
          <div
            className="rounded-full px-5 py-1.5 text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: currentStyle?.color ?? '#9CA3AF' }}
          >
            {currentStyle?.label ?? 'Neutral'}
          </div>
        </div>

        {/* Slider track */}
        <div className="relative px-2">
          {/* Track background - gradient from green to red */}
          <div className="relative h-4 rounded-full" style={{
            background: 'linear-gradient(to right, #10B981, #22C55E, #84CC16, #9CA3AF, #F97316, #EF4444, #E11D48)'
          }}>
            {/* Thumb */}
            <div
              className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
              style={{ left: `${(sliderValue / 6) * 100}%`, zIndex: 3 }}
            >
              <div
                className="h-11 w-11 rounded-full border-[4px] border-white"
                style={{ backgroundColor: currentStyle?.color ?? '#9CA3AF', boxShadow: '0 0 0 2px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.3)' }}
              />
            </div>

            {/* Tick marks */}
            {SLIDER_STANCES.map((_, i) => (
              <div
                key={`tick-${i}`}
                className="pointer-events-none absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-white/30"
                style={{ left: `${(i / 6) * 100}%` }}
              />
            ))}

            {/* Native range input — overlaid directly on track for drag */}
            <input
              type="range"
              min={0}
              max={6}
              step={1}
              value={sliderValue}
              onChange={(e) => selectStance(Number(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer"
              style={{ opacity: 0, zIndex: 10, margin: 0, padding: 0 }}
              aria-label="Stance slider"
            />
          </div>

          {/* Labels below slider */}
          <div className="mt-4 flex justify-between">
            {SLIDER_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => selectStance(i)}
                className={`text-center text-[10px] leading-[1.3] transition-colors sm:text-[11px] ${
                  sliderValue === i
                    ? 'font-semibold text-[var(--codex-text)]'
                    : 'text-[var(--codex-faint)] hover:text-[var(--codex-sub)]'
                }`}
                style={{ width: `${100 / 7}%`, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
              >
                {label.split('\n').map((line, j) => (
                  <span key={j}>{j > 0 && <br />}{line}</span>
                ))}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skip button */}
      <div className="mt-4 text-center">
        <button
          onClick={skip}
          className="text-[13px] text-[var(--codex-faint)] underline decoration-[var(--codex-border)] underline-offset-2 transition-colors hover:text-[var(--codex-sub)]"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Skip this question
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-center text-[13px] text-red-400">{error}</p>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="rounded-lg border border-[var(--codex-border)] px-5 py-2.5 text-[14px] font-medium text-[var(--codex-sub)] transition-colors hover:bg-[var(--codex-hover)] disabled:cursor-not-allowed disabled:opacity-30"
          style={{ background: 'none', cursor: currentStep === 0 ? 'not-allowed' : 'pointer' }}
        >
          Back
        </button>

        {isLast ? (
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--codex-text)] px-6 py-2.5 text-[14px] font-semibold text-[var(--codex-card)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Calculating...' : 'See Results'}
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
