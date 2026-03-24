'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Props {
  politicianId: string
  politicianName: string
}

export function UpdatePoliticianButton({ politicianId, politicianName }: Props) {
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
          type: 'update_politician',
          data: {
            politician_id: politicianId,
            politician_name: politicianName,
            field_to_update: form.get('field_to_update') ?? '',
            current_value: form.get('current_value') ?? '',
            suggested_value: form.get('suggested_value') ?? '',
            source_url: form.get('source_url') ?? '',
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
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--poli-border)] px-3.5 text-[12px] font-medium text-[var(--poli-sub)] transition-all hover:border-[var(--poli-input-focus)] hover:text-[var(--poli-text)]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Suggest Update
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div role="dialog" aria-modal="true" aria-labelledby="update-politician-title" className="w-full max-w-md rounded-xl border border-[var(--poli-border)] bg-[var(--poli-bg)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {success ? (
              <div className="text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-[var(--poli-sub)]"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                <div className="text-[14px] font-semibold text-[var(--poli-text)]">Update suggested</div>
                <p className="mt-1 text-[12px] text-[var(--poli-faint)]">We&apos;ll review and update if verified.</p>
              </div>
            ) : (
              <>
                <h2 id="update-politician-title" className="mb-1 text-[16px] font-semibold text-[var(--poli-text)]">Suggest an Update</h2>
                <p className="mb-4 text-[12px] text-[var(--poli-faint)]">for {politicianName}</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-[var(--poli-sub)]">What needs updating? <span className="text-red-400">*</span></label>
                    <select name="field_to_update" required className="w-full rounded-lg border border-[var(--poli-border)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--poli-text)] outline-none focus:border-[var(--poli-text)]">
                      <option value="">Select...</option>
                      <option value="title">Title / Office</option>
                      <option value="party">Party</option>
                      <option value="state">State</option>
                      <option value="bio">Bio</option>
                      <option value="photo">Photo</option>
                      <option value="website">Website URL</option>
                      <option value="social_media">Social Media</option>
                      <option value="stance">Stance on an Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-[var(--poli-sub)]">Current value (if known)</label>
                    <input name="current_value" maxLength={500} className="w-full rounded-lg border border-[var(--poli-border)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--poli-text)] outline-none focus:border-[var(--poli-text)]" placeholder="What it says now" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-[var(--poli-sub)]">Suggested value <span className="text-red-400">*</span></label>
                    <input name="suggested_value" required maxLength={500} className="w-full rounded-lg border border-[var(--poli-border)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--poli-text)] outline-none focus:border-[var(--poli-text)]" placeholder="What it should be" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-[var(--poli-sub)]">Source URL</label>
                    <input name="source_url" type="url" maxLength={500} className="w-full rounded-lg border border-[var(--poli-border)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--poli-text)] outline-none focus:border-[var(--poli-text)]" placeholder="https://..." />
                  </div>
                  {error && <p className="text-[12px] text-red-400">{error}</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[var(--poli-border)] px-4 py-2 text-[13px] text-[var(--poli-sub)] transition-colors hover:border-[var(--poli-text)]">Cancel</button>
                    <button type="submit" disabled={loading} className="rounded-lg bg-[var(--poli-text)] px-4 py-2 text-[13px] font-semibold text-[var(--poli-card)] transition-opacity hover:opacity-80 disabled:opacity-50">
                      {loading ? 'Sending...' : 'Submit'}
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
