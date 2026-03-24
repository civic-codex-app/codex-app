'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function DeleteAccount() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')

    try {
      // Server-side deletion (uses service role to delete auth user too)
      const res = await fetch('/api/auth/delete-account', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to delete account')
      }

      // Sign out client-side and redirect
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete account')
      setLoading(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-red-400/70 transition-colors hover:text-red-400"
      >
        Delete my account
      </button>
    )
  }

  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4">
      <p className="mb-3 text-sm text-red-400">
        Are you sure? This will permanently delete your account and all your data (follows, likes, poll votes). This cannot be undone.
      </p>
      {error && (
        <p className="mb-3 text-sm text-red-400">{error}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Yes, delete my account'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border border-[var(--poli-border)] px-4 py-2 text-sm text-[var(--poli-sub)] hover:text-[var(--poli-text)]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
