'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PARTIES } from '@/lib/constants/parties'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function NewPoliticianPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const name = form.get('name') as string

    const supabase = createClient()
    const { error: insertError } = await supabase.from('politicians').insert({
      name,
      slug: slugify(name),
      state: form.get('state') as string,
      chamber: form.get('chamber') as string,
      party: form.get('party') as string,
      title: form.get('title') as string,
      since_year: form.get('since_year') ? Number(form.get('since_year')) : null,
      bio: (form.get('bio') as string) || null,
      website_url: (form.get('website_url') as string) || null,
      donate_url: (form.get('donate_url') as string) || null,
      wiki_url: (form.get('wiki_url') as string) || null,
      image_url: (form.get('image_url') as string) || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/politicians')
    router.refresh()
  }

  const fieldClass =
    'w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-2.5 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]'
  const labelClass = 'mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]'

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-3xl">Add Politician</h1>

      {error && (
        <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" required className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Title *</label>
            <input name="title" required placeholder="e.g. U.S. Senator" className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>State *</label>
            <select name="state" required className={fieldClass}>
              <option value="">Select</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Chamber *</label>
            <select name="chamber" required className={fieldClass}>
              <option value="">Select</option>
              <option value="senate">Senate</option>
              <option value="house">House</option>
              <option value="governor">Governor</option>
              <option value="presidential">Presidential</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Party *</label>
            <select name="party" required className={fieldClass}>
              <option value="">Select</option>
              {Object.entries(PARTIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Since Year</label>
          <input name="since_year" type="number" min="1776" max="2030" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Bio</label>
          <textarea name="bio" rows={3} className={fieldClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Website URL</label>
            <input name="website_url" type="url" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Donate URL</label>
            <input name="donate_url" type="url" className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Wikipedia URL</label>
            <input name="wiki_url" type="url" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <input name="image_url" type="url" className={fieldClass} />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Politician'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
