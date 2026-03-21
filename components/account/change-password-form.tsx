'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { fieldClass, labelClass } from '@/lib/utils'

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const form = new FormData(e.currentTarget)
    const password = form.get('password') as string
    const confirm = form.get('confirm') as string

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
    } else {
      setSuccess(true)
      e.currentTarget.reset()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-[var(--codex-border)] p-6">
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400" role="alert">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400" role="status">
          Password updated
        </div>
      )}

      <div>
        <label htmlFor="new-password" className={labelClass}>New Password</label>
        <input id="new-password" name="password" type="password" required minLength={6} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="confirm-password" className={labelClass}>Confirm Password</label>
        <input id="confirm-password" name="confirm" type="password" required minLength={6} className={fieldClass} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Change Password'}
      </Button>
    </form>
  )
}
