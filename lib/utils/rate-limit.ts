import { NextRequest, NextResponse } from 'next/server'

/**
 * In-memory sliding window rate limiter.
 * Resets on cold start (acceptable for basic protection on Vercel).
 */

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

/** 60 requests per minute — public read endpoints */
export const PUBLIC_READ: RateLimitConfig = { windowMs: 60_000, maxRequests: 60 }

/** 10 requests per minute — expensive operations (match, delete account) */
export const EXPENSIVE_OP: RateLimitConfig = { windowMs: 60_000, maxRequests: 10 }

/** 30 requests per minute — write operations */
export const WRITE_OP: RateLimitConfig = { windowMs: 60_000, maxRequests: 30 }

const store = new Map<string, number[]>()

// Cleanup stale entries every 60 seconds
let cleanupScheduled = false
function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of store) {
      const filtered = timestamps.filter(t => now - t < 120_000)
      if (filtered.length === 0) store.delete(key)
      else store.set(key, filtered)
    }
  }, 60_000).unref?.()
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

type RateLimitResult =
  | { success: true }
  | { success: false; response: NextResponse }

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix?: string,
): RateLimitResult {
  scheduleCleanup()

  const ip = getIP(request)
  const route = keyPrefix ?? new URL(request.url).pathname
  const key = `${ip}:${route}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  const timestamps = store.get(key) ?? []
  const inWindow = timestamps.filter(t => t > windowStart)

  if (inWindow.length >= config.maxRequests) {
    const oldestInWindow = inWindow[0]
    const retryAfter = Math.ceil((oldestInWindow + config.windowMs - now) / 1000)
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(retryAfter, 1)),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
          },
        },
      ),
    }
  }

  inWindow.push(now)
  store.set(key, inWindow)

  return { success: true }
}
