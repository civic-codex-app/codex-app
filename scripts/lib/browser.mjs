/**
 * Launch the system Chrome through puppeteer-core — no browser download.
 * Shared by the browser-driven gates (check-overflow, check-pages).
 */
import puppeteer from 'puppeteer-core'
import { existsSync } from 'node:fs'

export const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].find((p) => existsSync(p))

export function launch() {
  if (!CHROME) {
    console.error('No Chrome or Chromium found in /Applications. Install one, or point puppeteer at a binary.')
    process.exit(1)
  }
  return puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--disable-dev-shm-usage'],
  })
}

/** True for the errors that mean the browser session died rather than the page failing. */
export const isSessionDeath = (e) => /Session|Target|detached|closed|Protocol error/i.test(e?.message ?? '')

/**
 * Sign in through the real login form, so the browser ends up with exactly the
 * cookies a person would. `login` is "email:password"; the password may
 * contain colons. Resolves once the app has navigated away from /login.
 */
export async function signIn(page, base, login) {
  const i = login.indexOf(':')
  const email = login.slice(0, i)
  const password = login.slice(i + 1)
  await page.goto(`${base}/login`, { waitUntil: 'networkidle2', timeout: 120000 })
  await page.type('#login-email', email)
  await page.type('#login-password', password)
  await page.click('button[type=submit]')
  try {
    await page.waitForFunction(() => location.pathname !== '/login', { timeout: 60000 })
  } catch {
    throw new Error(`login as ${email} did not leave /login within 60s — wrong credentials, or the form changed`)
  }
  // Let the landing page finish before the caller navigates away. Without
  // this, the next page's auth calls raced the sign-in for supabase-js's
  // navigator lock and the first route after signing in intermittently logged
  // 'Lock ... was released because another request stole it' — a gate that
  // fails one run in three is worse than no gate.
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 }).catch(() => {})
  return { email, landed: new URL(page.url()).pathname }
}
