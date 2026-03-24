'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PARTIES } from '@/lib/constants/parties'
import { ImageUpload } from '@/components/admin/image-upload'
import { slugify, fieldClass, labelClass } from '@/lib/utils'
import { politicianSchema } from '@/lib/validations/admin'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

export default function NewPoliticianPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
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
    const { error: insertError } = await supabase.from('politicians').insert({
      ...result.data,
      slug: slugify(result.data.name),
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/politicians')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Add Politician</h1>

      {error && (
        <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pol-name" className={labelClass}>Name *</label>
            <input id="pol-name" name="name" required className={fieldClass} />
          </div>
          <div>
            <label htmlFor="pol-title" className={labelClass}>Title *</label>
            <input id="pol-title" name="title" required placeholder="e.g. U.S. Senator" className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="pol-state" className={labelClass}>State *</label>
            <select id="pol-state" name="state" required className={fieldClass}>
              <option value="">Select</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pol-chamber" className={labelClass}>Chamber *</label>
            <select id="pol-chamber" name="chamber" required className={fieldClass}>
              <option value="">Select</option>
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
            <select id="pol-party" name="party" required className={fieldClass}>
              <option value="">Select</option>
              {Object.entries(PARTIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="pol-since-year" className={labelClass}>Since Year</label>
          <input id="pol-since-year" name="since_year" type="number" min="1776" max="2030" className={fieldClass} />
        </div>

        <div>
          <label htmlFor="pol-bio" className={labelClass}>Bio</label>
          <textarea id="pol-bio" name="bio" rows={3} className={fieldClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pol-website-url" className={labelClass}>Website URL</label>
            <input id="pol-website-url" name="website_url" type="url" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="pol-donate-url" className={labelClass}>Donate URL</label>
            <input id="pol-donate-url" name="donate_url" type="url" className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pol-wiki-url" className={labelClass}>Wikipedia URL</label>
            <input id="pol-wiki-url" name="wiki_url" type="url" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="pol-image-url" className={labelClass}>Image</label>
            <ImageUpload
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
              onChange={(e) => setImageUrl(e.target.value)}
              className={fieldClass}
            />
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
