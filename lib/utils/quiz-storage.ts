/**
 * Persist quiz answers to localStorage so users don't lose progress.
 * Also saves the current step so they can resume where they left off.
 */

const STORAGE_KEY = 'codex_quiz_answers'
const STEP_KEY = 'codex_quiz_step'

export function saveQuizAnswers(answers: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  } catch {
    // localStorage unavailable (SSR, private browsing full)
  }
}

export function loadQuizAnswers(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function saveQuizStep(step: number) {
  try {
    localStorage.setItem(STEP_KEY, String(step))
  } catch {}
}

export function loadQuizStep(): number {
  try {
    const stored = localStorage.getItem(STEP_KEY)
    return stored ? parseInt(stored, 10) : 0
  } catch {
    return 0
  }
}

export function clearQuizProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STEP_KEY)
  } catch {}
}
