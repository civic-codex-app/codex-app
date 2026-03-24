'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Check your email</h1>
        <p className="mb-8 text-sm text-[var(--codex-sub)]">
          We sent a password reset link to {email}
        </p>
        <Link href="/login" className="text-sm text-[var(--codex-sub)] hover:text-[var(--codex-text)]">
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Reset password</h1>
        <p className="text-sm text-[var(--codex-sub)]">
          Enter your email to receive a reset link
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending...' : 'Send reset link'}
      </Button>

      <div className="text-center text-xs text-[var(--codex-sub)]">
        <Link href="/login" className="hover:text-[var(--codex-text)]">
          ← Back to sign in
        </Link>
      </div>
    </form>
  )
}
