'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { US_STATES, STATE_NAMES } from '@/lib/constants/us-states'
import { IssueIcon } from '@/components/icons/issue-icon'
import { Button } from '@/components/ui/button'
import { cn, fieldClass } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Issues (hardcoded to avoid async fetch in a client component)     */
/* ------------------------------------------------------------------ */
const ISSUES = [
  { slug: 'economy', name: 'Economy', icon: 'briefcase', category: 'economy' },
  { slug: 'healthcare', name: 'Healthcare', icon: 'heart-pulse', category: 'healthcare' },
  { slug: 'immigration', name: 'Immigration', icon: 'globe', category: 'immigration' },
  { slug: 'education', name: 'Education', icon: 'graduation-cap', category: 'education' },
  { slug: 'defense', name: 'Defense', icon: 'shield', category: 'defense' },
  { slug: 'environment', name: 'Environment', icon: 'leaf', category: 'environment' },
  { slug: 'criminal-justice', name: 'Criminal Justice', icon: 'scale', category: 'justice' },
  { slug: 'foreign-policy', name: 'Foreign Policy', icon: 'landmark', category: 'foreign_policy' },
  { slug: 'technology', name: 'Technology', icon: 'cpu', category: 'technology' },
  { slug: 'social-issues', name: 'Social Issues', icon: 'users', category: 'social' },
  { slug: 'gun-policy', name: 'Gun Policy', icon: 'target', category: 'gun_policy' },
  { slug: 'infrastructure', name: 'Infrastructure', icon: 'hard-hat', category: 'infrastructure' },
  { slug: 'housing', name: 'Housing', icon: 'home', category: 'housing' },
  { slug: 'energy', name: 'Energy', icon: 'zap', category: 'energy' },
] as const

const TOTAL_STEPS = 3

/* ------------------------------------------------------------------ */
/*  Wizard                                                            */
/* ------------------------------------------------------------------ */
export function OnboardingWizard({ profileId }: { profileId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward')

  // Step 1 state
  const [selectedState, setSelectedState] = useState('')

  // Step 2 state
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /* -- navigation helpers -- */
  const goForward = useCallback(() => {
    setAnimDir('forward')
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }, [])

  const goBack = useCallback(() => {
    setAnimDir('back')
    setStep((s) => Math.max(s - 1, 1))
  }, [])

  /* -- save state to Supabase (step 1 -> 2) -- */
  async function saveStateAndAdvance() {
    if (!selectedState) {
      setError('Please select your state')
      return
    }
    setError('')
    setSaving(true)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ state: selectedState })
      .eq('id', profileId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }
    setSaving(false)
    goForward()
  }

  /* -- save issues to localStorage (step 2 -> 3) -- */
  function saveIssuesAndAdvance() {
    if (selectedIssues.length < 3) {
      setError('Please select at least 3 issues')
      return
    }
    if (selectedIssues.length > 5) {
      setError('Please select at most 5 issues')
      return
    }
    setError('')
    localStorage.setItem('codex_top_issues', JSON.stringify(selectedIssues))
    goForward()
  }

  function toggleIssue(slug: string) {
    setSelectedIssues((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  function skip() {
    router.push('/dashboard')
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                i + 1 === step
                  ? 'w-6 bg-[var(--codex-text)]'
                  : i + 1 < step
                    ? 'bg-[var(--codex-text)] opacity-40'
                    : 'bg-[var(--codex-border)]'
              )}
            />
          ))}
        </div>

        {/* Card */}
        <div
          key={step}
          className={cn(
            'rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-8',
            'animate-fade-in'
          )}
          style={{
            animation: `${animDir === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.25s ease-out`,
          }}
        >
          {/* -------- Step 1: State -------- */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="mb-2 font-serif text-2xl text-[var(--codex-text)]">
                  Where do you live?
                </h1>
                <p className="text-sm text-[var(--codex-sub)]">
                  We&apos;ll show you your local representatives
                </p>
              </div>

              {error && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className={fieldClass}
              >
                <option value="">Select your state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {STATE_NAMES[s]} ({s})
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={skip}
                  className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
                >
                  Skip
                </button>
                <Button onClick={saveStateAndAdvance} disabled={saving}>
                  {saving ? 'Saving...' : 'Next'}
                </Button>
              </div>
            </div>
          )}

          {/* -------- Step 2: Issues -------- */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="mb-2 font-serif text-2xl text-[var(--codex-text)]">
                  What issues matter to you?
                </h1>
                <p className="text-sm text-[var(--codex-sub)]">
                  Select 3 to 5 topics you care about most
                </p>
              </div>

              {error && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ISSUES.map((issue) => {
                  const active = selectedIssues.includes(issue.slug)
                  return (
                    <button
                      key={issue.slug}
                      type="button"
                      onClick={() => toggleIssue(issue.slug)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-md border px-3 py-4 text-center transition-all duration-150',
                        active
                          ? 'border-[var(--codex-text)] bg-[var(--codex-hover)] text-[var(--codex-text)]'
                          : 'border-[var(--codex-border)] text-[var(--codex-sub)] hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]'
                      )}
                    >
                      <IssueIcon icon={issue.icon} size={22} />
                      <span className="text-xs font-medium">{issue.name}</span>
                    </button>
                  )
                })}
              </div>

              <div className="text-center text-xs text-[var(--codex-faint)]">
                {selectedIssues.length} of 3-5 selected
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={skip}
                    className="text-xs text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
                  >
                    Skip
                  </button>
                </div>
                <Button onClick={saveIssuesAndAdvance}>Next</Button>
              </div>
            </div>
          )}

          {/* -------- Step 3: Voter Match -------- */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="mb-2 font-serif text-2xl text-[var(--codex-text)]">
                  Find your match
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--codex-sub)]">
                  Take a 2-minute quiz to find which politicians align with your
                  views on the issues that matter to you.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => router.push('/match')}
                  className="w-full"
                >
                  Take the Quiz
                </Button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full rounded-md border border-[var(--codex-border)] px-4 py-2 text-sm text-[var(--codex-sub)] transition-colors hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
                >
                  Skip for now
                </button>
              </div>

              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline keyframe styles for slide animations */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
