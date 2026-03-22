'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fieldClass, labelClass } from '@/lib/utils'

const FIELDS: { key: string; label: string; description: string; multiline?: boolean }[] = [
  {
    key: 'site_name',
    label: 'Site / App Name',
    description: 'The primary name shown in the browser tab, manifest, and branding. (e.g. "Codex")',
  },
  {
    key: 'site_tagline',
    label: 'Tagline',
    description: 'Short phrase after the site name in the title bar. (e.g. "Political Directory")',
  },
  {
    key: 'site_description',
    label: 'Site Description',
    description: 'Default meta description for search engines.',
    multiline: true,
  },
  {
    key: 'og_title',
    label: 'Social Share Title (OG)',
    description: 'Title shown when the site is shared on social media.',
  },
  {
    key: 'og_description',
    label: 'Social Share Description (OG)',
    description: 'Description shown when the site is shared on social media.',
    multiline: true,
  },
  {
    key: 'homepage_title',
    label: 'Homepage Title',
    description: 'The title tag for the homepage specifically.',
  },
  {
    key: 'homepage_description',
    label: 'Homepage Description',
    description: 'Meta description for the homepage.',
    multiline: true,
  },
]

interface Props {
  initialSettings: Record<string, string>
}

export function SiteSettingsForm({ initialSettings }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: values }),
      })

      if (!res.ok) {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error ?? 'Failed to save' })
      } else {
        setMessage({ type: 'success', text: 'Settings saved. Changes will appear on the next page load.' })
        router.refresh()
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {FIELDS.map((field) => (
        <div key={field.key}>
          <label className={labelClass} htmlFor={field.key}>
            {field.label}
          </label>
          {field.multiline ? (
            <textarea
              id={field.key}
              value={values[field.key] ?? ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={3}
              className={`${fieldClass} resize-y rounded-md`}
            />
          ) : (
            <input
              id={field.key}
              type="text"
              value={values[field.key] ?? ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={`${fieldClass} rounded-md`}
            />
          )}
          <p className="mt-1 text-[11px] text-[var(--codex-faint)]">{field.description}</p>
        </div>
      ))}

      {message && (
        <div
          className="rounded-md border px-4 py-3 text-sm"
          style={{
            borderColor: message.type === 'success' ? '#22C55E33' : '#EF444433',
            background: message.type === 'success' ? '#22C55E08' : '#EF444408',
            color: message.type === 'success' ? '#22C55E' : '#EF4444',
          }}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[var(--codex-text)] px-5 py-2.5 text-sm font-medium text-[var(--codex-bg)] transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
