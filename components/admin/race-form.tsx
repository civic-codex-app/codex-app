'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { slugify, fieldClass, labelClass } from '@/lib/utils'
import { US_STATES } from '@/lib/constants/us-states'
import { raceSchema } from '@/lib/validations/admin'

const CHAMBERS = [
  { value: 'senate', label: 'Senate' },
  { value: 'house', label: 'House' },
  { value: 'governor', label: 'Governor' },
  { value: 'presidential', label: 'Presidential' },
  { value: 'mayor', label: 'Mayor' },
  { value: 'city_council', label: 'City Council' },
  { value: 'state_senate', label: 'State Senate' },
  { value: 'state_house', label: 'State House' },
  { value: 'county', label: 'County' },
  { value: 'school_board', label: 'School Board' },
  { value: 'other_local', label: 'Other Local' },
]

interface Politician {
  id: string
  name: string
}

interface Props {
  election_id: string
  race?: {
    id: string
    name: string
    slug: string
    state: string
    chamber: string
    district: string | null
    description: string | null
    incumbent_id: string | null
  }
  politicians: Politician[]
}

export function RaceForm({ election_id, race, politicians }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const form = new FormData(e.currentTarget)

    const data = {
      name: form.get('name') as string,
      state: form.get('state') as string,
      chamber: form.get('chamber') as string,
      district: (form.get('district') as string) || null,
      description: (form.get('description') as string) || null,
      incumbent_id: (form.get('incumbent_id') as string) || null,
    }

    const result = raceSchema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join(', '))
      setLoading(false)
      return
    }

    const raceData = {
      ...result.data,
      ...(race ? {} : { slug: slugify(result.data.name), election_id }),
    }

    if (race) {
      const { error: updateError } = await supabase
        .from('races')
        .update(raceData)
        .eq('id', race.id)
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('races').insert(raceData)
      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push(`/admin/elections/${election_id}`)
    router.refresh()
  }

  async function handleDelete() {
    if (!race) return
    if (!confirm('Delete this race and all its candidates? This cannot be undone.')) return
    setDeleting(true)

    const supabase = createClient()
    await supabase.from('candidates').delete().eq('race_id', race.id)
    await supabase.from('races').delete().eq('id', race.id)

    router.push(`/admin/elections/${election_id}`)
    router.refresh()
  }

  return (
    <>
      {error && (
        <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="race-name" className={labelClass}>Name *</label>
          <input id="race-name" name="name" required defaultValue={race?.name ?? ''} className={fieldClass} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="race-state" className={labelClass}>State *</label>
            <select id="race-state" name="state" required defaultValue={race?.state ?? ''} className={fieldClass}>
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="race-chamber" className={labelClass}>Chamber *</label>
            <select id="race-chamber" name="chamber" required defaultValue={race?.chamber ?? ''} className={fieldClass}>
              <option value="">Select chamber</option>
              {CHAMBERS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="race-district" className={labelClass}>District</label>
            <input id="race-district" name="district" defaultValue={race?.district ?? ''} className={fieldClass} />
          </div>
        </div>

        <div>
          <label htmlFor="race-incumbent" className={labelClass}>Incumbent</label>
          <select id="race-incumbent" name="incumbent_id" defaultValue={race?.incumbent_id ?? ''} className={fieldClass}>
            <option value="">None</option>
            {politicians.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="race-description" className={labelClass}>Description</label>
          <textarea id="race-description" name="description" rows={4} defaultValue={race?.description ?? ''} className={fieldClass} />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : race ? 'Save Changes' : 'Add Race'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          {race && (
            <Button type="button" variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
