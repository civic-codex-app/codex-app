'use client'

import { useState, useRef } from 'react'

interface Field {
  name: string
  label: string
  type?: 'text' | 'email' | 'textarea' | 'select' | 'url'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  maxLength?: number
}

interface SubmissionFormProps {
  type: string
  fields: Field[]
  submitLabel?: string
  successMessage?: string
}

export function SubmissionForm({ type, fields, submitLabel = 'Submit', successMessage = 'Thanks! We\'ll review your submission.' }: SubmissionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const tsRef = useRef(Date.now())

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    for (const field of fields) {
      data[field.name] = (formData.get(field.name) as string) ?? ''
    }

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          website: formData.get('website') ?? '',
          _ts: tsRef.current,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to submit')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-[var(--poli-border)] p-8 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-[var(--poli-sub)]">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <div className="text-[15px] font-semibold text-[var(--poli-text)]">Submitted</div>
        <p className="mt-1 text-[13px] text-[var(--poli-sub)]">{successMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {fields.map((field) => (
        <div key={field.name}>
          <label className="mb-1.5 block text-[12px] font-medium text-[var(--poli-sub)]">
            {field.label}
            {field.required && <span className="text-red-400"> *</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              maxLength={field.maxLength ?? 5000}
              rows={4}
              className="w-full resize-none rounded-lg border border-[var(--poli-border)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--poli-text)] outline-none transition-colors placeholder:text-[var(--poli-faint)] focus:border-[var(--poli-text)]"
            />
          ) : field.type === 'select' ? (
            <select
              name={field.name}
              required={field.required}
              className="w-full rounded-lg border border-[var(--poli-border)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--poli-text)] outline-none transition-colors focus:border-[var(--poli-text)]"
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type ?? 'text'}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              maxLength={field.maxLength ?? 500}
              className="w-full rounded-lg border border-[var(--poli-border)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--poli-text)] outline-none transition-colors placeholder:text-[var(--poli-faint)] focus:border-[var(--poli-text)]"
            />
          )}
        </div>
      ))}

      {error && (
        <p className="text-[12px] text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[var(--poli-text)] px-5 py-2.5 text-[13px] font-semibold text-[var(--poli-card)] transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : submitLabel}
      </button>
    </form>
  )
}
