/**
 * Persist quiz answers to localStorage so users don't lose progress.
 * Also saves the current step so they can resume where they left off.
 *
 * For logged-in users, answers are also synced to Supabase (profiles.quiz_answers)
 * so they persist across devices.
 */

const STORAGE_KEY = 'codex_quiz_answers'
const STEP_KEY = 'codex_quiz_step'

// ---------------------------------------------------------------------------
// localStorage (fast, offline cache)
// ---------------------------------------------------------------------------

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
