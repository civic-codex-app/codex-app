'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PARTIES } from '@/lib/constants/parties'
import type { Politician } from '@/lib/types/politician'
import { ImageUpload } from '@/components/admin/image-upload'

const politicianSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  title: z.string().min(1, 'Title is required').max(200),
  state: z.string().min(2, 'State is required').max(2),
  chamber: z.enum(['senate', 'house', 'governor', 'presidential', 'mayor', 'city_council', 'state_senate', 'state_house', 'county', 'school_board', 'other_local']),
  party: z.string().min(1, 'Party is required'),
  since_year: z.number().min(1776).max(2030).nullable().optional(),
  bio: z.string().max(5000).nullable().optional(),
  website_url: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  donate_url: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  wiki_url: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  image_url: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
})

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

interface Props {
  politician: Politician
}

export function PoliticianEditForm({ politician }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [imageUrl, setImageUrl] = useState(politician.image_url ?? '')
  const imageInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const data = {
      name: form.get('name') as string,
      title: form.get('title') as string,
      state: form.get('state') as string,
      chamber: form.get('chamber') as string,
      party: form.get('party') as string,
      since_year: form.get('since_year') ? Number(form.get('since_year')) : null,
      bio: (form.get('bio') as string) || null,
      website_url: (form.get('website_url') as string) || null,
      donate_url: (form.get('donate_url') as string) || null,
      wiki_url: (form.get('wiki_url') as string) || null,
      image_url: (form.get('image_url') as string) || null,
    }

    const result = politicianSchema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join(', '))
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('politicians')
      .update({
        ...result.data,
        slug: slugify(result.data.name),
      })
      .eq('id', politician.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/admin/politicians')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this politician?')) return
    setDeleting(true)

    const supabase = createClient()
    await supabase.from('politicians').delete().eq('id', politician.id)

    router.push('/admin/politicians')
    router.refresh()
  }

  const fieldClass =
    'w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-2.5 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]'
  const labelClass = 'mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]'

  return (
    <>
      {error && (
        <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pol-name" className={labelClass}>Name *</label>
            <input id="pol-name" name="name" required defaultValue={politician.name} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="pol-title" className={labelClass}>Title *</label>
            <input id="pol-title" name="title" required defaultValue={politician.title} className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="pol-state" className={labelClass}>State *</label>
            <select id="pol-state" name="state" required defaultValue={politician.state} className={fieldClass}>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pol-chamber" className={labelClass}>Chamber *</label>
            <select id="pol-chamber" name="chamber" required defaultValue={politician.chamber} className={fieldClass}>
              <option value="senate">Senate</option>
              <option value="house">House</option>
              <option value="governor">Governor</option>
              <option value="presidential">Presidential</option>
              <option value="mayor">Mayor</option>
              <option value="city_council">City Council</option>
              <option value="state_senate">State Senate</option>
              <option value="state_house">State House</option>
              <option value="county">County</option>
              <option value="school_board">School Board</option>
              <option value="other_local">Other Local</option>
            </select>
          </div>
          <div>
            <label htmlFor="pol-party" className={labelClass}>Party *</label>
            <select id="pol-party" name="party" required defaultValue={politician.party} className={fieldClass}>
              {Object.entries(PARTIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="pol-since-year" className={labelClass}>Since Year</label>
          <input
            id="pol-since-year"
            name="since_year"
            type="number"
            min="1776"
            max="2030"
            defaultValue={politician.since_year ?? ''}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="pol-bio" className={labelClass}>Bio</label>
          <textarea id="pol-bio" name="bio" rows={3} defaultValue={politician.bio ?? ''} className={fieldClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pol-website-url" className={labelClass}>Website URL</label>
            <input id="pol-website-url" name="website_url" type="url" defaultValue={politician.website_url ?? ''} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="pol-donate-url" className={labelClass}>Donate URL</label>
            <input id="pol-donate-url" name="donate_url" type="url" defaultValue={politician.donate_url ?? ''} className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pol-wiki-url" className={labelClass}>Wikipedia URL</label>
            <input id="pol-wiki-url" name="wiki_url" type="url" defaultValue={politician.wiki_url ?? ''} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="pol-image-url" className={labelClass}>Image</label>
            <ImageUpload
              currentUrl={politician.image_url}
              folder="politicians"
              onUpload={(url) => {
                setImageUrl(url)
                if (imageInputRef.current) imageInputRef.current.value = url
              }}
              className="mb-2"
            />
            <input
              ref={imageInputRef}
              id="pol-image-url"
              name="image_url"
              type="url"
              placeholder="Or enter URL manually"
              defaultValue={politician.image_url ?? ''}
              onChange={(e) => setImageUrl(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </form>
    </>
  )
}
