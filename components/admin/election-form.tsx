'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { slugify, fieldClass, labelClass } from '@/lib/utils'
import { electionSchema } from '@/lib/validations/admin'

interface Props {
  election?: {
    id: string
    name: string
    slug: string
    election_date: string
    description: string | null
    is_active: boolean
  }
}

export function ElectionForm({ election }: Props) {
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
      election_date: form.get('election_date') as string,
      description: (form.get('description') as string) || null,
      is_active: form.has('is_active'),
    }

    const result = electionSchema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join(', '))
      setLoading(false)
      return
    }

    const electionData = {
      ...result.data,
      ...(election ? {} : { slug: slugify(result.data.name) }),
    }

    if (election) {
      const { error: updateError } = await supabase
        .from('elections')
        .update(electionData)
        .eq('id', election.id)
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('elections').insert(electionData)
      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push('/admin/elections')
    router.refresh()
  }

  async function handleDelete() {
    if (!election) return
    if (!confirm('Delete this election and all its races and candidates? This cannot be undone.')) return
    setDeleting(true)

    const supabase = createClient()

    // Fetch races for this election to cascade delete candidates
    const { data: races } = await supabase.from('races').select('id').eq('election_id', election.id)
    if (races && races.length > 0) {
      const raceIds = races.map((r: any) => r.id)
      await supabase.from('candidates').delete().in('race_id', raceIds)
    }
    await supabase.from('races').delete().eq('election_id', election.id)
    await supabase.from('elections').delete().eq('id', election.id)

    router.push('/admin/elections')
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
            <label htmlFor="election-name" className={labelClass}>Name *</label>
            <input id="election-name" name="name" required defaultValue={election?.name ?? ''} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="election-date" className={labelClass}>Election Date *</label>
            <input
              id="election-date"
              name="election_date"
              type="date"
              required
              defaultValue={election?.election_date ? election.election_date.split('T')[0] : ''}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="election-description" className={labelClass}>Description</label>
          <textarea id="election-description" name="description" rows={4} defaultValue={election?.description ?? ''} className={fieldClass} />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="election-is-active"
            name="is_active"
            type="checkbox"
            defaultChecked={election?.is_active ?? true}
            className="h-4 w-4"
          />
          <label htmlFor="election-is-active" className="text-sm text-[var(--codex-text)]">Active</label>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : election ? 'Save Changes' : 'Add Election'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          {election && (
            <Button type="button" variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
