'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SubmitAnnotationProps {
  politicianId: string
  issueId?: string
}

const ANNOTATION_TYPES = [
  { value: 'correction', label: 'Correction', description: 'Fix an inaccuracy' },
  { value: 'source', label: 'Source', description: 'Add a supporting source' },
  { value: 'context', label: 'Context', description: 'Provide additional context' },
] as const

export function SubmitAnnotation({ politicianId, issueId }: SubmitAnnotationProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [annotationType, setAnnotationType] = useState<string>('context')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      setLoading(false)
    }
    checkAuth()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!content.trim()) {
      setError('Please enter your annotation.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          politicianId,
          issueId: issueId || null,
          annotationType,
          content: content.trim(),
          sourceUrl: sourceUrl.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to submit annotation.')
        return
      }

      setSuccess(true)
      setContent('')
      setSourceUrl('')
      setAnnotationType('context')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  if (!userId) {
    return (
      <div className="rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] p-4">
        <p className="text-sm text-[var(--poli-sub)]">
          <a href="/login" className="underline text-[var(--poli-text)] hover:opacity-80">
            Sign in
          </a>{' '}
          to contribute corrections, sources, or context.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] p-4 space-y-3"
    >
      <h3 className="text-sm font-semibold text-[var(--poli-sub)]">Contribute an Annotation</h3>

      {/* Type selector */}
      <div className="flex gap-2">
        {ANNOTATION_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setAnnotationType(t.value)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              annotationType === t.value
                ? 'border-[var(--poli-text)] bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
                : 'border-[var(--poli-border)] text-[var(--poli-sub)] hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]'
            }`}
            title={t.description}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          annotationType === 'correction'
            ? 'Describe the inaccuracy and what the correct information is...'
            : annotationType === 'source'
              ? 'Describe what this source demonstrates...'
              : 'Provide additional context or information...'
        }
        rows={3}
        maxLength={2000}
        className="w-full rounded-md border border-[var(--poli-input-border)] bg-transparent px-3 py-2 text-sm text-[var(--poli-text)] placeholder:text-[var(--poli-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--poli-text)] resize-y"
      />
      <div className="text-right text-[11px] text-[var(--poli-faint)]">
        {content.length}/2000
      </div>

      {/* Source URL */}
      <input
        type="url"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        placeholder="Source URL (optional)"
        className="w-full rounded-md border border-[var(--poli-input-border)] bg-transparent px-3 py-2 text-sm text-[var(--poli-text)] placeholder:text-[var(--poli-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--poli-text)]"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {success && (
        <p className="text-xs text-green-600">
          Submitted! Your annotation will appear after review.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="rounded-md bg-[var(--poli-text)] px-4 py-2 text-sm font-medium text-[var(--poli-card)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
