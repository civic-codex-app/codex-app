'use client'

import { useState, useEffect } from 'react'

export function SharingToggle() {
  const [enabled, setEnabled] = useState(false)
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/sharing')
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled ?? false)
        setAnonymousId(data.anonymousId ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle() {
    setToggling(true)
    try {
      const res = await fetch('/api/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      })
      const data = await res.json()
      if (res.ok) {
        setEnabled(data.enabled)
        setAnonymousId(data.anonymousId)
      }
    } catch {
      // silently fail
    } finally {
      setToggling(false)
    }
  }

  function copyLink() {
    if (!anonymousId) return
    const url = `${window.location.origin}/compare/users?them=${anonymousId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const displayId = anonymousId ? anonymousId.slice(0, 4).toUpperCase() : '----'

  if (loading) {
    return (
      <div className="rounded-md border border-[var(--codex-border)] p-6">
        <div className="h-4 w-48 animate-pulse rounded bg-[var(--codex-border)]" />
      </div>
    )
  }

  return (
    <div className="rounded-md border border-[var(--codex-border)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--codex-text)]">
            Community Profile
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--codex-faint)]">
            Share your political stances anonymously
          </p>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="relative h-6 w-11 rounded-full transition-colors disabled:opacity-50"
          style={{
            backgroundColor: enabled ? '#3b82f6' : 'var(--codex-border)',
          }}
          aria-label={enabled ? 'Disable sharing' : 'Enable sharing'}
        >
          <span
            className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {enabled && anonymousId && (
        <div className="space-y-3">
          {/* Anonymous identity */}
          <div className="flex items-center gap-3 rounded-md bg-[var(--codex-hover)] px-4 py-3">
            <div
              className="h-9 w-9 shrink-0 rounded-full"
              style={{ background: 'conic-gradient(#3b82f6 0% 40%, #6b7280 40% 55%, #ef4444 55% 100%)' }}
            />
            <div>
              <div className="text-[13px] font-medium text-[var(--codex-text)]">
                Voter #{displayId}
              </div>
              <div className="text-[11px] text-[var(--codex-faint)]">
                Your anonymous identity on the community page
              </div>
            </div>
          </div>

          {/* Copy compare link */}
          <button
            onClick={copyLink}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--codex-border)] px-4 py-2.5 text-[13px] font-medium text-[var(--codex-sub)] transition-colors hover:border-[var(--codex-input-border)] hover:text-[var(--codex-text)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {copied ? 'Copied!' : 'Copy compare link'}
          </button>

          <p className="text-[11px] leading-[1.6] text-[var(--codex-faint)]">
            Others can compare their stances with yours using this link.
            Your real name, email, and personal info are never shared.
          </p>
        </div>
      )}

      {!enabled && (
        <p className="text-[12px] leading-[1.6] text-[var(--codex-faint)]">
          When enabled, your quiz stances appear on the community page as an anonymous voter.
          No personal information is ever shared — only your state and issue positions.
        </p>
      )}
    </div>
  )
}
