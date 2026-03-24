'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">New password</h1>
        <p className="text-sm text-[var(--codex-sub)]">Enter your new password below</p>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="reset-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          New Password
        </label>
        <input
          id="reset-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]"
        />
      </div>

      <div>
        <label htmlFor="reset-confirm" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          Confirm Password
        </label>
        <input
          id="reset-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Updating...' : 'Update password'}
      </Button>

      <div className="text-center text-xs text-[var(--codex-sub)]">
        <Link href="/login" className="hover:text-[var(--codex-text)]">
          ← Back to sign in
        </Link>
      </div>
    </form>
  )
}
