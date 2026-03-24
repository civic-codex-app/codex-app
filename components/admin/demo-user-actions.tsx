'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DemoUserActions({ count }: { count: number }) {
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete all ${count} demo community members? This cannot be undone.`)) return

    setDeleting(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/demo-users', { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        setMessage(`Error: ${data.error}`)
      } else {
        setMessage(`Deleted ${data.deleted} demo users${data.failed ? ` (${data.failed} failed)` : ''}`)
        router.refresh()
      }
    } catch {
      setMessage('Network error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {count > 0 && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-500/30 px-4 py-2 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete All Demo Users'}
        </button>
      )}
      {count === 0 && (
        <p className="text-[12px] text-[var(--poli-faint)]">
          Run <code className="rounded bg-[var(--poli-hover)] px-1.5 py-0.5 text-[11px]">node scripts/seed-demo-community.mjs</code> to create
        </p>
      )}
      {message && (
        <p className="text-[12px] text-[var(--poli-sub)]">{message}</p>
      )}
    </div>
  )
}
