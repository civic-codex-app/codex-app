'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { fieldClass, labelClass } from '@/lib/utils'
import { PARTIES } from '@/lib/constants/parties'

const STATUSES = [
  { value: 'running', label: 'Running' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

interface Politician {
  id: string
  name: string
}

interface Props {
  race_id: string
  election_id: string
  candidate?: {
    id: string
    name: string
    party: string
    is_incumbent: boolean
    status: string
    politician_id: string | null
    website_url: string | null
    image_url: string | null
    bio: string | null
  }
  politicians: Politician[]
}

export function CandidateForm({ race_id, election_id, candidate, politicians }: Props) {
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

    const candidateData = {
      name: form.get('name') as string,
      party: form.get('party') as string,
      is_incumbent: form.has('is_incumbent'),
      status: form.get('status') as string,
      politician_id: (form.get('politician_id') as string) || null,
      website_url: (form.get('website_url') as string) || null,
      image_url: (form.get('image_url') as string) || null,
      bio: (form.get('bio') as string) || null,
      ...(candidate ? {} : { race_id }),
    }

    if (candidate) {
      const { error: updateError } = await supabase
        .from('candidates')
        .update(candidateData)
        .eq('id', candidate.id)
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('candidates').insert(candidateData)
      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push(`/admin/elections/${election_id}/races/${race_id}`)
    router.refresh()
  }

  async function handleDelete() {
    if (!candidate) return
    if (!confirm('Delete this candidate? This cannot be undone.')) return
    setDeleting(true)

    const supabase = createClient()
    await supabase.from('candidates').delete().eq('id', candidate.id)

    router.push(`/admin/elections/${election_id}/races/${race_id}`)
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="candidate-name" className={labelClass}>Name *</label>
            <input id="candidate-name" name="name" required defaultValue={candidate?.name ?? ''} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="candidate-party" className={labelClass}>Party *</label>
            <select id="candidate-party" name="party" required defaultValue={candidate?.party ?? ''} className={fieldClass}>
              <option value="">Select party</option>
              {Object.entries(PARTIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="candidate-status" className={labelClass}>Status *</label>
            <select id="candidate-status" name="status" required defaultValue={candidate?.status ?? 'running'} className={fieldClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="candidate-politician" className={labelClass}>Linked Politician</label>
            <select id="candidate-politician" name="politician_id" defaultValue={candidate?.politician_id ?? ''} className={fieldClass}>
              <option value="">None</option>
              {politicians.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="candidate-is-incumbent"
            name="is_incumbent"
            type="checkbox"
            defaultChecked={candidate?.is_incumbent ?? false}
            className="h-4 w-4"
          />
          <label htmlFor="candidate-is-incumbent" className="text-sm text-[var(--codex-text)]">Incumbent</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="candidate-website-url" className={labelClass}>Website URL</label>
            <input id="candidate-website-url" name="website_url" type="url" defaultValue={candidate?.website_url ?? ''} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="candidate-image-url" className={labelClass}>Image URL</label>
            <input id="candidate-image-url" name="image_url" type="url" defaultValue={candidate?.image_url ?? ''} className={fieldClass} />
          </div>
        </div>

        <div>
          <label htmlFor="candidate-bio" className={labelClass}>Bio</label>
          <textarea id="candidate-bio" name="bio" rows={4} defaultValue={candidate?.bio ?? ''} className={fieldClass} />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : candidate ? 'Save Changes' : 'Add Candidate'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          {candidate && (
            <Button type="button" variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
