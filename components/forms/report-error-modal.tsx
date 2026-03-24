'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export function ReportErrorButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const tsRef = useRef(Date.now())

  const closeModal = useCallback(() => { setOpen(false); setSuccess(false) }, [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closeModal])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report_error',
          data: {
            page_url: window.location.href,
            description: form.get('description') ?? '',
          },
          website: '',
          _ts: tsRef.current,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to submit')
      }
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false) }, 2000)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] text-[var(--poli-faint)] transition-colors hover:text-[var(--poli-sub)]"
      >
        Report an error
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div role="dialog" aria-modal="true" aria-labelledby="report-error-title" className="w-full max-w-md rounded-xl border border-[var(--poli-border)] bg-[var(--poli-bg)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {success ? (
              <div className="text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-[var(--poli-sub)]"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                <div className="text-[14px] font-semibold text-[var(--poli-text)]">Report submitted</div>
              </div>
            ) : (
              <>
                <h2 id="report-error-title" className="mb-1 text-[16px] font-semibold text-[var(--poli-text)]">Report an Error</h2>
                <p className="mb-4 text-[12px] text-[var(--poli-faint)]">Found something wrong on this page? Let us know.</p>
                <form onSubmit={handleSubmit}>
                  <label htmlFor="report-error-description" className="sr-only">Describe the error</label>
                  <textarea
                    id="report-error-description"
                    name="description"
                    required
                    maxLength={2000}
                    rows={4}
                    placeholder="Describe the error..."
                    className="mb-3 w-full resize-none rounded-lg border border-[var(--poli-border)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--poli-text)] outline-none transition-colors placeholder:text-[var(--poli-faint)] focus:border-[var(--poli-text)]"
                  />
                  {error && <p className="mb-2 text-[12px] text-red-400">{error}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[var(--poli-border)] px-4 py-2 text-[13px] text-[var(--poli-sub)] transition-colors hover:border-[var(--poli-text)]">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="rounded-lg bg-[var(--poli-text)] px-4 py-2 text-[13px] font-semibold text-[var(--poli-card)] transition-opacity hover:opacity-80 disabled:opacity-50">
                      {loading ? 'Sending...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
