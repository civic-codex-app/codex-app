'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { fieldClass, labelClass } from '@/lib/utils'
import { US_STATES } from '@/lib/constants/us-states'

interface Profile {
  id: string
  display_name: string | null
  email: string | null
  role: string
  bio: string | null
  state: string | null
  avatar_url: string | null
  notifications_enabled: boolean
}

export function AccountForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: (form.get('display_name') as string) || null,
        bio: (form.get('bio') as string) || null,
        state: (form.get('state') as string) || null,
        notifications_enabled: form.get('notifications') === 'on',
      })
      .eq('id', profile!.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
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
          Profile updated
        </div>
      )}

      <div>
        <label htmlFor="acct-email" className={labelClass}>Email</label>
        <input id="acct-email" disabled value={profile?.email ?? ''} className={`${fieldClass} opacity-50`} />
      </div>

      <div>
        <label htmlFor="acct-display-name" className={labelClass}>Display Name</label>
        <input id="acct-display-name" name="display_name" defaultValue={profile?.display_name ?? ''} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="acct-state" className={labelClass}>State</label>
        <select id="acct-state" name="state" defaultValue={profile?.state ?? ''} className={fieldClass}>
          <option value="">Not specified</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="acct-bio" className={labelClass}>Bio</label>
        <textarea id="acct-bio" name="bio" rows={3} defaultValue={profile?.bio ?? ''} className={fieldClass} />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="notifications"
          id="notifications"
          defaultChecked={profile?.notifications_enabled ?? true}
          className="h-4 w-4 rounded border-[var(--codex-border)] bg-[var(--codex-input-bg)]"
        />
        <label htmlFor="notifications" className="text-sm text-[var(--codex-sub)]">
          Enable notifications
        </label>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
        <span className="text-[11px] uppercase tracking-wider text-[var(--codex-faint)]">
          Role: {profile?.role ?? 'user'}
        </span>
      </div>
    </form>
  )
}
