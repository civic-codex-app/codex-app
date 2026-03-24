'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NotificationPrefs {
  election_reminders: boolean
  stance_updates: boolean
  new_votes: boolean
  weekly_digest: boolean
}

const DEFAULT_PREFS: NotificationPrefs = {
  election_reminders: true,
  stance_updates: true,
  new_votes: false,
  weekly_digest: false,
}

const PREF_OPTIONS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  {
    key: 'election_reminders',
    label: 'Election Reminders',
    description: 'Get notified about upcoming elections in your state',
  },
  {
    key: 'stance_updates',
    label: 'Stance Updates',
    description: 'When politicians you follow change positions on issues',
  },
  {
    key: 'new_votes',
    label: 'New Votes',
    description: 'When politicians you follow vote on bills',
  },
  {
    key: 'weekly_digest',
    label: 'Weekly Digest',
    description: 'A weekly summary of political activity relevant to you',
  },
]

export function NotificationPreferences({ profileId }: { profileId: string }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Load current prefs from profile
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('notification_prefs')
        .eq('id', profileId)
        .single()

      if (data?.notification_prefs && typeof data.notification_prefs === 'object') {
        setPrefs({ ...DEFAULT_PREFS, ...(data.notification_prefs as Partial<NotificationPrefs>) })
      }
      setLoading(false)
    }

    load()
  }, [profileId])

  async function handleToggle(key: keyof NotificationPrefs) {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    setSaved(false)
    setError('')
    setSaving(true)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ notification_prefs: updated })
      .eq('id', profileId)

    if (updateError) {
      // Revert on error
      setPrefs(prefs)
      setError('Failed to save preferences')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="rounded-md border border-[var(--poli-border)] px-6 py-6">
        <p className="text-sm text-[var(--poli-faint)]">Loading preferences...</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-[var(--poli-border)]">
      {error && (
        <div className="border-b border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="divide-y divide-[var(--poli-border)]">
        {PREF_OPTIONS.map((opt) => (
          <div
            key={opt.key}
            className="flex items-center justify-between px-5 py-4"
          >
            <div className="min-w-0 flex-1 pr-4">
              <div className="text-sm font-medium text-[var(--poli-text)]">
                {opt.label}
              </div>
              <div className="mt-0.5 text-xs text-[var(--poli-sub)]">
                {opt.description}
              </div>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={prefs[opt.key]}
              aria-label={`${opt.label} ${prefs[opt.key] ? 'enabled' : 'disabled'}`}
              disabled={saving}
              onClick={() => handleToggle(opt.key)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--poli-text)] focus:ring-offset-2 focus:ring-offset-[var(--poli-bg)] disabled:opacity-50"
              style={{
                backgroundColor: prefs[opt.key]
                  ? '#10B981'
                  : 'var(--poli-border)',
              }}
            >
              <span
                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                style={{
                  transform: prefs[opt.key]
                    ? 'translateX(20px)'
                    : 'translateX(0px)',
                }}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Status footer */}
      <div className="border-t border-[var(--poli-border)] px-5 py-3">
        <p className="text-[11px] text-[var(--poli-faint)]">
          {saved
            ? 'Preferences saved'
            : 'Notification delivery coming soon. Your preferences will be ready when it launches.'}
        </p>
      </div>
    </div>
  )
}
