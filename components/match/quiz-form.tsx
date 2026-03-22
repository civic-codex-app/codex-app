'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { IssueIcon } from '@/components/icons/issue-icon'
import { MatchResults } from './match-results'
import { QUIZ_CONTENT } from '@/lib/data/quiz-content'
import { saveQuizAnswers, loadQuizAnswers, saveQuizStep, loadQuizStep, clearQuizProgress } from '@/lib/utils/quiz-storage'

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

type Side = 'for' | 'against'
type Intensity = 'strongly' | 'somewhat' | 'lean'

/** Map side + intensity to the 7-point stance scale */
function toStance(side: Side, intensity: Intensity): string {
  if (side === 'for') {
    if (intensity === 'strongly') return 'strongly_supports'
    if (intensity === 'somewhat') return 'supports'
    return 'leans_support'
  }
  if (intensity === 'strongly') return 'strongly_opposes'
  if (intensity === 'somewhat') return 'opposes'
  return 'leans_oppose'
}

/** Split content string into bullet points by splitting on periods */
function toBullets(text: string): string[] {
  return text
    .split('.')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/** Determine if a stance is on the "for" side */
function isForSide(stance: string): boolean {
  return (
    stance === 'strongly_supports' ||
    stance === 'supports' ||
    stance === 'leans_support'
  )
}

const MILESTONES: Record<number, string> = {
  4: 'Great start! 10 more to go',
  7: 'Halfway there!',
  11: 'Almost done! Just 3 left',
}

interface Props {
  issues: Issue[]
}

export function QuizForm({ issues }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => loadQuizAnswers())
  const [currentStep, setCurrentStep] = useState(() => loadQuizStep())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<MatchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Card interaction state
  const [selectedSide, setSelectedSide] = useState<Side | null>(null)
  const [showCheck, setShowCheck] = useState(false)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  // Swipe state
  const touchRef = useRef<{ startX: number; startY: number; swiping: boolean }>({
    startX: 0,
    startY: 0,
    swiping: false,
  })
  const [swipeOffset, setSwipeOffset] = useState(0)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  // Auto-advance timer ref
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const total = issues.length
  const issue = issues[currentStep]
  const answeredCount = Object.keys(answers).length

  // Count for/against answers
  const forCount = Object.values(answers).filter(isForSide).length
  const againstCount = answeredCount - forCount

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  // Reset selected side when step changes
  useEffect(() => {
    setSelectedSide(null)
    setShowCheck(false)
    setSwipeOffset(0)
  }, [currentStep])

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= total) return
      const goingForward = step > currentStep
      setSlideDir(goingForward ? 'left' : 'right')
      // Small delay so animation class applies
      requestAnimationFrame(() => {
        setCurrentStep(step); saveQuizStep(step)
        setTimeout(() => setSlideDir(null), 350)
      })
    },
    [currentStep, total]
  )

  function selectIntensity(side: Side, intensity: Intensity) {
    const stance = toStance(side, intensity)
    setAnswers((prev) => { const next = { ...prev, [issue.slug]: stance }; saveQuizAnswers(next); return next })
    setShowCheck(true)

    const newAnsweredCount = answeredCount + (answers[issue.slug] ? 0 : 1)
    const nextStep = currentStep + 1

    // Check milestones
    const milestoneMsg = MILESTONES[newAnsweredCount]

    if (advanceTimer.current) clearTimeout(advanceTimer.current)

    if (nextStep >= total) {
      // Last question -- auto-submit after brief delay
      advanceTimer.current = setTimeout(() => {
        if (milestoneMsg) {
          setMilestone(milestoneMsg)
          setTimeout(() => {
            setMilestone(null)
            submit()
          }, 1200)
        } else {
          submit()
        }
      }, 500)
    } else {
      advanceTimer.current = setTimeout(() => {
        if (milestoneMsg) {
          setMilestone(milestoneMsg)
          setTimeout(() => {
            setMilestone(null)
            goToStep(nextStep)
          }, 1200)
        } else {
          goToStep(nextStep)
        }
      }, 500)
    }
  }

  function pickSide(side: Side) {
    setSelectedSide(side)
  }

  function skip() {
    if (currentStep < total - 1) {
      goToStep(currentStep + 1)
    } else {
      submit()
    }
  }

  function goBack() {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
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
    setAnswers({}); clearQuizProgress()
    setCurrentStep(0)
    setResults(null)
    setError(null)
    setSelectedSide(null)
    setShowCheck(false)
    setMilestone(null)
  }

  // Swipe handlers
  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, swiping: false }
  }

  function onTouchMove(e: React.TouchEvent) {
    const touch = e.touches[0]
    const dx = touch.clientX - touchRef.current.startX
    const dy = touch.clientY - touchRef.current.startY

    // Only treat as swipe if horizontal movement exceeds vertical
    if (!touchRef.current.swiping && Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy)) {
      touchRef.current.swiping = true
    }

    if (touchRef.current.swiping) {
      e.preventDefault()
      setSwipeOffset(Math.max(-150, Math.min(150, dx)))
    }
  }

  function onTouchEnd() {
    if (touchRef.current.swiping) {
      const threshold = 60
      if (swipeOffset > threshold) {
        // Swiped right = pick "For"
        pickSide('for')
      } else if (swipeOffset < -threshold) {
        // Swiped left = pick "Against"
        pickSide('against')
      }
    }
    setSwipeOffset(0)
    touchRef.current.swiping = false
  }

  if (results) {
    return <MatchResults results={results} onRetake={retake} />
  }

  if (!issue) return null

  const content = QUIZ_CONTENT[issue.slug]
  const forBullets = content ? toBullets(content.supportsMeans) : []
  const againstBullets = content ? toBullets(content.opposesMeans) : []

  // Determine swipe tilt
  const tiltDeg = swipeOffset * 0.06
  const swipeOpacityFor = swipeOffset > 30 ? Math.min(1, (swipeOffset - 30) / 60) : 0
  const swipeOpacityAgainst =
    swipeOffset < -30 ? Math.min(1, (-swipeOffset - 30) / 60) : 0

  return (
    <div className="relative">
      {/* CSS Keyframes */}
      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes milestonePop {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          40% { transform: scale(1.05) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes milestoneFade {
          0% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(-60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes dotPop {
          0% { transform: scale(0); }
          60% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
        }
        .quiz-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .quiz-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .quiz-card:active {
          transform: translateY(0) scale(0.98);
        }
        .quiz-card-selected {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .intensity-btn {
          transition: all 0.15s ease;
        }
        .intensity-btn:hover {
          transform: scale(1.05);
        }
        .intensity-btn:active {
          transform: scale(0.95);
        }
        .slide-in-left {
          animation: slideInLeft 0.3s ease forwards;
        }
        .slide-in-right {
          animation: slideInRight 0.3s ease forwards;
        }
      `}</style>

      {/* Milestone overlay */}
      {milestone && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
          <div
            className="rounded-2xl border border-[var(--codex-border)] bg-[var(--codex-card)] px-8 py-5 text-center shadow-2xl"
            style={{ animation: 'milestonePop 0.4s ease forwards' }}
          >
            <div className="text-[24px]">&#127881;</div>
            <p className="mt-1 text-[16px] font-semibold text-[var(--codex-text)]">
              {milestone}
            </p>
          </div>
        </div>
      )}

      {/* Submitting overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-[var(--codex-card)]/80 backdrop-blur-sm">
          <div className="text-center">
            <div
              className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-[var(--codex-text)] border-t-transparent"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
            <p className="text-[14px] font-medium text-[var(--codex-sub)]">
              Calculating your matches...
            </p>
          </div>
        </div>
      )}

      {/* Progress indicator - question count */}
      <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-[var(--codex-sub)]">
        <span className="uppercase tracking-[0.1em]">
          Question {currentStep + 1} of {total}
        </span>
        <span>{answeredCount} answered</span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[var(--codex-border)]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep + 1) / total) * 100}%`,
            background: 'linear-gradient(90deg, #3B82F6, #2563EB)',
          }}
        />
      </div>

      {/* Issue header */}
      <div
        className={`mb-5 text-center ${slideDir === 'left' ? 'slide-in-left' : slideDir === 'right' ? 'slide-in-right' : ''}`}
      >
        <div className="mb-2 flex items-center justify-center gap-2 text-[var(--codex-sub)]">
          <IssueIcon icon={issue.icon} size={18} />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em]">
            {issue.name}
          </span>
        </div>
        <h2 className="text-[clamp(1.1rem,2.8vw,1.5rem)] font-semibold leading-snug text-[var(--codex-text)]">
          {content?.question ?? issue.name}
        </h2>
        {content?.whyItMatters && (
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-[var(--codex-sub)]">
            {content.whyItMatters}
          </p>
        )}
      </div>

      {/* Swipe hint on mobile */}
      <p className="mb-3 text-center text-[11px] text-[var(--codex-faint)] sm:hidden">
        Swipe right for "For" or left for "Against"
      </p>

      {/* "This or That" Cards */}
      <div
        ref={cardContainerRef}
        className={`relative grid grid-cols-1 gap-3 sm:grid-cols-2 ${slideDir === 'left' ? 'slide-in-left' : slideDir === 'right' ? 'slide-in-right' : ''}`}
        style={{
          transform: swipeOffset ? `rotate(${tiltDeg}deg)` : undefined,
          transition: swipeOffset ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Swipe indicator overlays */}
        {swipeOpacityFor > 0 && (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-500/10"
            style={{ opacity: swipeOpacityFor }}
          >
            <span className="text-[20px] font-bold text-blue-500">SIDE A</span>
          </div>
        )}
        {swipeOpacityAgainst > 0 && (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-red-500 bg-red-500/10"
            style={{ opacity: swipeOpacityAgainst }}
          >
            <span className="text-[20px] font-bold text-red-500">SIDE B</span>
          </div>
        )}

        {/* FOR card */}
        <button
          onClick={() => pickSide('for')}
          className={`quiz-card relative cursor-pointer rounded-xl border-2 p-4 text-left ${
            selectedSide === 'for'
              ? 'quiz-card-selected border-blue-500 bg-blue-500/10'
              : 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40'
          }`}
          style={{ background: 'none', font: 'inherit' }}
        >
          {/* Card header */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-[13px] font-bold text-blue-500">
              A
            </div>
            <span className="text-[13px] font-bold uppercase tracking-wider text-blue-500">
              Side A
            </span>
          </div>

          {/* Bullet points */}
          <ul className="space-y-2">
            {forBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.5] text-[var(--codex-sub)]">
                <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500/50" />
                {bullet}
              </li>
            ))}
          </ul>

          {/* Intensity selector - appears inside card when selected */}
          {selectedSide === 'for' && (
            <div className="mt-4 border-t border-blue-500/20 pt-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-blue-600">
                How strongly?
              </p>
              <div className="flex gap-2">
                {(['strongly', 'somewhat', 'lean'] as Intensity[]).map((intensity) => {
                  const labels = { strongly: 'Strongly', somewhat: 'Somewhat', lean: 'Lean this way' }
                  return (
                    <button
                      key={intensity}
                      onClick={(e) => {
                        e.stopPropagation()
                        selectIntensity('for', intensity)
                      }}
                      className="intensity-btn flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-2 text-[12px] font-semibold text-blue-600 hover:bg-blue-500/20"
                    >
                      {labels[intensity]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selected indicator */}
          {showCheck && selectedSide === 'for' && (
            <div
              className="absolute right-3 top-3 h-4 w-4 rounded-full bg-blue-500"
              style={{ animation: 'checkPop 0.3s ease forwards' }}
            />
          )}
        </button>

        {/* AGAINST card */}
        <button
          onClick={() => pickSide('against')}
          className={`quiz-card relative cursor-pointer rounded-xl border-2 p-4 text-left ${
            selectedSide === 'against'
              ? 'quiz-card-selected border-red-500 bg-red-500/10'
              : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
          }`}
          style={{ background: 'none', font: 'inherit' }}
        >
          {/* Card header */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-[13px] font-bold text-red-500">
              B
            </div>
            <span className="text-[13px] font-bold uppercase tracking-wider text-red-500">
              Side B
            </span>
          </div>

          {/* Bullet points */}
          <ul className="space-y-2">
            {againstBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.5] text-[var(--codex-sub)]">
                <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500/50" />
                {bullet}
              </li>
            ))}
          </ul>

          {/* Intensity selector - appears inside card when selected */}
          {selectedSide === 'against' && (
            <div className="mt-4 border-t border-red-500/20 pt-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-red-600">
                How strongly?
              </p>
              <div className="flex gap-2">
                {(['strongly', 'somewhat', 'lean'] as Intensity[]).map((intensity) => {
                  const labels = { strongly: 'Strongly', somewhat: 'Somewhat', lean: 'Lean this way' }
                  return (
                    <button
                      key={intensity}
                      onClick={(e) => {
                        e.stopPropagation()
                        selectIntensity('against', intensity)
                      }}
                      className="intensity-btn flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-500/20"
                    >
                      {labels[intensity]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selected indicator */}
          {showCheck && selectedSide === 'against' && (
            <div
              className="absolute right-3 top-3 h-4 w-4 rounded-full bg-red-500"
              style={{ animation: 'checkPop 0.3s ease forwards' }}
            />
          )}
        </button>
      </div>

      {/* Live Profile Strip */}
      <div className="mt-6">
        <div className="flex items-center justify-center gap-1.5">
          {issues.map((iss, i) => {
            const ans = answers[iss.slug]
            const isCurrent = i === currentStep
            let dotColor = 'bg-[var(--codex-border)]' // unanswered
            if (ans) {
              dotColor = isForSide(ans) ? 'bg-blue-500' : 'bg-red-500'
            }
            return (
              <button
                key={iss.slug}
                onClick={() => goToStep(i)}
                className={`rounded-full transition-all ${dotColor} ${
                  isCurrent
                    ? 'h-3.5 w-3.5 ring-2 ring-[var(--codex-text)] ring-offset-1 ring-offset-[var(--codex-card)]'
                    : 'h-2.5 w-2.5 hover:scale-125'
                }`}
                style={{
                  animation: ans && i === currentStep ? 'dotPop 0.3s ease forwards' : undefined,
                }}
                title={`${iss.name}${ans ? (isForSide(ans) ? ' (For)' : ' (Against)') : ''}`}
              />
            )
          })}
        </div>

        {/* Profile message */}
        <div className="mt-3 text-center text-[12px] text-[var(--codex-sub)]">
          {answeredCount >= 7 ? (
            <p>
              Halfway there! You lean{' '}
              <span className="font-semibold text-blue-500">for</span> on {forCount} issue
              {forCount !== 1 ? 's' : ''},{' '}
              <span className="font-semibold text-red-500">against</span> on {againstCount}
            </p>
          ) : answeredCount >= 3 ? (
            <p className="text-[var(--codex-faint)]">Your profile is taking shape...</p>
          ) : null}
        </div>
      </div>

      {/* Skip + Back links */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="text-[13px] text-[var(--codex-faint)] transition-colors hover:text-[var(--codex-sub)] disabled:opacity-30"
          style={{ background: 'none', border: 'none', cursor: currentStep === 0 ? 'default' : 'pointer' }}
        >
          &larr; Back
        </button>

        <button
          onClick={skip}
          className="text-[13px] text-[var(--codex-faint)] underline decoration-[var(--codex-border)] underline-offset-2 transition-colors hover:text-[var(--codex-sub)]"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Skip
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-center text-[13px] text-red-400">{error}</p>
      )}

      {/* Submit button - only show if user is on last question and has answered enough */}
      {currentStep === total - 1 && answeredCount >= 3 && !showCheck && (
        <div className="mt-5 text-center">
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--codex-text)] px-8 py-3 text-[14px] font-semibold text-[var(--codex-card)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Calculating...' : 'See My Matches'}
          </button>
        </div>
      )}
    </div>
  )
}
