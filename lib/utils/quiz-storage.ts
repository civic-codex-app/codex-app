/**
 * Persist quiz answers to localStorage so users don't lose progress.
 * Also saves the current step so they can resume where they left off.
 *
 * For logged-in users, answers are also synced to Supabase (profiles.quiz_answers)
 * so they persist across devices.
 */

const STORAGE_KEY = 'poli_quiz_answers'
const STEP_KEY = 'poli_quiz_step'

// ---------------------------------------------------------------------------
// localStorage (fast, offline cache)
// ---------------------------------------------------------------------------

export function saveQuizAnswers(answers: Record<string, string>, userId?: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, userId: userId ?? null }))
  } catch {
    // localStorage unavailable (SSR, private browsing full)
  }
}

export function loadQuizAnswers(userId?: string): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    // Handle legacy format (plain object of answers)
    if (!parsed.answers) return userId ? {} : parsed
    // If userId provided, only return answers belonging to same user
    if (userId && parsed.userId !== userId) return {}
    return parsed.answers
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

const RESULTS_KEY = 'poli_quiz_results'

export function saveQuizResults(results: any, stateResults: any, userId?: string) {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify({ results, stateResults, savedAt: Date.now(), userId: userId ?? null }))
  } catch {}
}

export function loadQuizResults(userId?: string): { results: any[]; stateResults: any[] } | null {
  try {
    const stored = localStorage.getItem(RESULTS_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    // Results are valid for 24 hours
    if (Date.now() - (parsed.savedAt ?? 0) > 24 * 60 * 60 * 1000) return null
    // Only return results if they belong to the same user
    // If userId is provided but cached results have no userId or a different one, reject
    if (userId && parsed.userId !== userId) return null
    return { results: parsed.results ?? [], stateResults: parsed.stateResults ?? [] }
  } catch {
    return null
  }
}

export function clearQuizProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STEP_KEY)
    localStorage.removeItem(RESULTS_KEY)
  } catch {}
}

// ---------------------------------------------------------------------------
// Server sync (Supabase — requires auth)
// ---------------------------------------------------------------------------

/**
 * Push the user's quiz answers to the server.
 * Silently fails for unauthenticated users or network errors.
 */
export async function syncQuizToServer(answers: Record<string, string>): Promise<void> {
  try {
    await fetch('/api/quiz-answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
  } catch {
    // Network error — localStorage still has the data
  }
}

/**
 * Load quiz answers from the server.
 * Returns null if unauthenticated or on error.
 */
export async function loadQuizFromServer(): Promise<Record<string, string> | null> {
  try {
    // Skip server call if no auth cookie present (avoids 401 noise)
    if (typeof document !== 'undefined' && !document.cookie.includes('sb-')) return null
    const res = await fetch('/api/quiz-answers')
    if (!res.ok) return null
    const data = await res.json()
    return data.answers ?? null
  } catch {
    return null
  }
}

/**
 * Merge server answers with local answers.
 * Prefers whichever source has more answers (more = newer/more complete).
 * If equal count, merges both (server wins per-key conflicts).
 */
export function mergeQuizAnswers(
  local: Record<string, string>,
  server: Record<string, string> | null
): Record<string, string> {
  if (!server) return local

  const localCount = Object.keys(local).length
  const serverCount = Object.keys(server).length

  // If server has strictly more answers, use server as base
  if (serverCount > localCount) {
    return { ...local, ...server }
  }

  // If local has strictly more, use local as base
  if (localCount > serverCount) {
    return { ...server, ...local }
  }

  // Equal count — merge, server wins ties
  return { ...local, ...server }
}
