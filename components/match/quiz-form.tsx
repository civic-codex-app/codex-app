'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { IssueIcon } from '@/components/icons/issue-icon'
import { MatchResults } from './match-results'
import { QUIZ_CONTENT, type QuizPosition } from '@/lib/data/quiz-content'
import { saveQuizAnswers, loadQuizAnswers, saveQuizStep, loadQuizStep, clearQuizProgress, syncQuizToServer, loadQuizFromServer, mergeQuizAnswers, saveQuizResults, loadQuizResults } from '@/lib/utils/quiz-storage'
import { createClient } from '@/lib/supabase/client'

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

/** Color config for each position — deeper shades toward the extremes */
const POSITION_COLORS = [
  { bg: 'rgba(29, 78, 216, 0.15)', border: 'rgba(29, 78, 216, 0.4)', text: '#1D4ED8', dot: '#1D4ED8' },  // strongly for — deep blue
  { bg: 'rgba(59, 130, 246, 0.10)', border: 'rgba(59, 130, 246, 0.3)', text: '#3B82F6', dot: '#3B82F6' }, // for — blue
  { bg: 'rgba(156, 163, 175, 0.10)', border: 'rgba(156, 163, 175, 0.3)', text: '#9CA3AF', dot: '#9CA3AF' }, // neutral — gray
  { bg: 'rgba(239, 68, 68, 0.10)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444', dot: '#EF4444' },  // against — red
  { bg: 'rgba(220, 38, 38, 0.15)', border: 'rgba(220, 38, 38, 0.4)', text: '#DC2626', dot: '#DC2626' },  // strongly against — deep red
]

const MILESTONES: Record<number, string> = {
  4: 'Nice! 10 more to go',
  7: 'Halfway there!',
  11: 'Almost done! Just 3 left',
}

function isForSide(stance: string): boolean {
  return stance === 'strongly_supports' || stance === 'supports' || stance === 'leans_support'
}

function stanceToColorIndex(stance: string): number {
  if (stance === 'strongly_supports') return 0
  if (stance === 'supports' || stance === 'leans_support') return 1
  if (stance === 'neutral' || stance === 'mixed') return 2
  if (stance === 'opposes' || stance === 'leans_oppose') return 3
  return 4
}

/** Default positions when issue doesn't have custom ones */
function defaultPositions(supportsMeans: string, opposesMeans: string): QuizPosition[] {
  return [
    { label: 'Fully for it', description: supportsMeans, stance: 'strongly_supports' },
    { label: 'Mostly for it', description: 'You lean this way but see some downsides.', stance: 'supports' },
    { label: 'Not sure yet', description: 'You see both sides or need to learn more.', stance: 'neutral' },
    { label: 'Mostly against it', description: 'You lean this way but see some upsides.', stance: 'opposes' },
    { label: 'Fully against it', description: opposesMeans, stance: 'strongly_opposes' },
  ]
}

interface Props {
  issues: Issue[]
}

export function QuizForm({ issues }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => loadQuizAnswers())
  const [currentStep, setCurrentStep] = useState(() => loadQuizStep())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<MatchResult[] | null>(null)
  const [stateResults, setStateResults] = useState<MatchResult[]>([])
  const [userState, setUserState] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCheck, setShowCheck] = useState(false)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLoggedIn = useRef(false)
  // Load cached results on mount
  const [initialLoaded, setInitialLoaded] = useState(false)

  // On mount: check auth and load from server if logged in
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || cancelled) return
        isLoggedIn.current = true

        // Get user's state for location-relevant results
        const { data: profile } = await supabase.from('profiles').select('state').eq('id', user.id).single()
        if (profile?.state && !cancelled) setUserState(profile.state)

        const serverAnswers = await loadQuizFromServer()
        if (cancelled) return

        const local = loadQuizAnswers()
        const merged = mergeQuizAnswers(local, serverAnswers)

        if (Object.keys(merged).length > 0) {
          setAnswers(merged)
          saveQuizAnswers(merged)
          if (Object.keys(local).length > Object.keys(serverAnswers ?? {}).length) {
            syncQuizToServer(merged)
          }
        }
      } catch {
        // Not logged in or network error — continue with localStorage only
      }

      // Load cached results if available
      const cached = loadQuizResults()
      if (cached && cached.results.length > 0 && !cancelled) {
        setResults(cached.results)
        setStateResults(cached.stateResults)
      }
      if (!cancelled) setInitialLoaded(true)
    }
    init()
    return () => { cancelled = true }
  }, [])

  const total = issues.length
  const issue = issues[currentStep]
  const answeredCount = Object.keys(answers).length
  const forCount = Object.values(answers).filter(isForSide).length
  const againstCount = answeredCount - forCount

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
      if (syncTimer.current) clearTimeout(syncTimer.current)
    }
  }, [])

  useEffect(() => {
    setShowCheck(false)
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step < 0 || step >= total) return
    setSlideDir(step > currentStep ? 'left' : 'right')
    requestAnimationFrame(() => {
      setCurrentStep(step)
      saveQuizStep(step)
      setTimeout(() => setSlideDir(null), 350)
    })
  }, [currentStep, total])

  function selectPosition(stance: string) {
    setAnswers(prev => {
      const next = { ...prev, [issue.slug]: stance }
      saveQuizAnswers(next)
      // Debounced server sync (1 second)
      if (isLoggedIn.current) {
        if (syncTimer.current) clearTimeout(syncTimer.current)
        syncTimer.current = setTimeout(() => syncQuizToServer(next), 1000)
      }
      return next
    })
    setShowCheck(true)

    const newCount = answeredCount + (answers[issue.slug] ? 0 : 1)
    const nextStep = currentStep + 1
    const milestoneMsg = MILESTONES[newCount]

    if (advanceTimer.current) clearTimeout(advanceTimer.current)

    advanceTimer.current = setTimeout(() => {
      if (milestoneMsg) {
        setMilestone(milestoneMsg)
        setTimeout(() => {
          setMilestone(null)
          if (nextStep >= total) submit()
          else goToStep(nextStep)
        }, 1200)
      } else {
        if (nextStep >= total) submit()
        else goToStep(nextStep)
      }
    }, 600)
  }

  function skip() {
    if (currentStep < total - 1) goToStep(currentStep + 1)
    else submit()
  }

  function goBack() {
    if (currentStep > 0) goToStep(currentStep - 1)
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
        body: JSON.stringify({ stances: validStances, userState }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
      setResults(data.results)
      setStateResults(data.yourState ?? [])
      saveQuizResults(data.results, data.yourState ?? [])
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function retake() {
    setAnswers({})
    clearQuizProgress()
    if (isLoggedIn.current) syncQuizToServer({})
    setCurrentStep(0)
    setResults(null)
    setStateResults([])
    setError(null)
    setShowCheck(false)
    setMilestone(null)
  }

  function editAnswers() {
    // Go back to the quiz with current answers intact
    setResults(null)
    setStateResults([])
    setCurrentStep(0)
  }

  function updateResults() {
    // Re-submit current answers to get fresh results with any new data
    submit()
  }

  // Show results if we have them (cached or fresh)
  if (results) return <MatchResults results={results} stateResults={stateResults} userState={userState} onRetake={retake} onEditAnswers={editAnswers} onUpdateResults={updateResults} />

  // Show loading while checking for cached results (prevents quiz flash)
  if (!initialLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--codex-text)] border-t-transparent" />
          <p className="text-[14px] text-[var(--codex-faint)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!issue) return null

  const content = QUIZ_CONTENT[issue.slug]
  const positions: QuizPosition[] = content?.positions?.length
    ? content.positions
    : content
      ? defaultPositions(content.supportsMeans, content.opposesMeans)
      : defaultPositions('You support this.', 'You oppose this.')

  const currentAnswer = answers[issue.slug]

  return (
    <div className="relative">
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
        @keyframes slideInLeft {
          from { transform: translateX(60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(-60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .slide-in-left { animation: slideInLeft 0.3s ease forwards; }
        .slide-in-right { animation: slideInRight 0.3s ease forwards; }
        .position-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .position-card:hover {
          transform: translateX(4px);
        }
        .position-card:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Milestone overlay */}
      {milestone && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
          <div
            className="rounded-2xl border border-[var(--codex-border)] bg-[var(--codex-card)] px-8 py-5 text-center shadow-2xl"
            style={{ animation: 'milestonePop 0.4s ease forwards' }}
          >
            <p className="text-[16px] font-semibold text-[var(--codex-text)]">{milestone}</p>
          </div>
        </div>
      )}

      {/* Submitting overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-[var(--codex-card)]/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--codex-text)] border-t-transparent" />
            <p className="text-[14px] font-medium text-[var(--codex-sub)]">Finding your matches...</p>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-[var(--codex-sub)]">
        <span className="uppercase tracking-[0.1em]">Question {currentStep + 1} of {total}</span>
        <span>{answeredCount} answered</span>
      </div>
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[var(--codex-border)]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep + 1) / total) * 100}%`,
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EF4444)',
          }}
        />
      </div>

      {/* Issue header */}
      <div className={`mb-6 text-center ${slideDir === 'left' ? 'slide-in-left' : slideDir === 'right' ? 'slide-in-right' : ''}`}>
        <div className="mb-2 flex items-center justify-center gap-2 text-[var(--codex-sub)]">
          <IssueIcon icon={issue.icon} size={18} />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em]">{issue.name}</span>
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

      {/* Position cards — vertical stack */}
      <div className={`space-y-2 ${slideDir === 'left' ? 'slide-in-left' : slideDir === 'right' ? 'slide-in-right' : ''}`}>
        {positions.map((pos, i) => {
          const colors = POSITION_COLORS[i] ?? POSITION_COLORS[2]
          const isSelected = currentAnswer === pos.stance

          return (
            <button
              key={pos.stance}
              onClick={() => selectPosition(pos.stance)}
              className={`position-card relative w-full rounded-xl border-2 p-4 text-left ${
                isSelected ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: isSelected ? colors.bg : 'transparent',
                borderColor: isSelected ? colors.border : 'var(--codex-border)',
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Color indicator bar */}
                <div
                  className="mt-0.5 h-10 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: colors.dot, opacity: isSelected ? 1 : 0.3 }}
                />

                <div className="flex-1">
                  <div className="text-[14px] font-semibold" style={{ color: isSelected ? colors.text : 'var(--codex-text)' }}>
                    {pos.label}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-[1.5] text-[var(--codex-sub)]">
                    {pos.description}
                  </p>
                </div>

                {/* Selected dot */}
                {isSelected && (
                  <div
                    className="mt-1 h-4 w-4 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: colors.dot, animation: 'checkPop 0.3s ease forwards' }}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Live Profile Strip */}
      <div className="mt-6">
        <div className="flex items-center justify-center gap-1.5">
          {issues.map((iss, i) => {
            const ans = answers[iss.slug]
            const isCurrent = i === currentStep
            const colorIdx = ans ? stanceToColorIndex(ans) : -1
            const dotColor = colorIdx >= 0 ? POSITION_COLORS[colorIdx].dot : undefined

            return (
              <button
                key={iss.slug}
                onClick={() => goToStep(i)}
                className={`rounded-full transition-all ${
                  isCurrent
                    ? 'h-3.5 w-3.5 ring-2 ring-[var(--codex-text)] ring-offset-1 ring-offset-[var(--codex-card)]'
                    : 'h-2.5 w-2.5 hover:scale-125'
                }`}
                style={{
                  backgroundColor: dotColor ?? 'var(--codex-border)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
                title={`${iss.name}${ans ? '' : ' (unanswered)'}`}
              />
            )
          })}
        </div>

        <div className="mt-3 text-center text-[12px] text-[var(--codex-sub)]">
          {answeredCount >= 7 ? (
            <p>
              Halfway! <span className="font-semibold" style={{ color: '#3B82F6' }}>{forCount}</span> leaning blue,{' '}
              <span className="font-semibold" style={{ color: '#EF4444' }}>{againstCount}</span> leaning red
            </p>
          ) : answeredCount >= 3 ? (
            <p className="text-[var(--codex-faint)]">Your profile is taking shape...</p>
          ) : null}
        </div>
      </div>

      {/* Skip + Back */}
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

      {error && <p className="mt-4 text-center text-[13px] text-red-400">{error}</p>}

      {currentStep === total - 1 && answeredCount >= 3 && !showCheck && (
        <div className="mt-5 text-center">
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--codex-text)] px-8 py-3 text-[14px] font-semibold text-[var(--codex-card)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            See My Results
          </button>
        </div>
      )}
    </div>
  )
}
