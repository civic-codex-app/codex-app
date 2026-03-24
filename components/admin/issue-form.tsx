'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { slugify, fieldClass, labelClass } from '@/lib/utils'
import { issueSchema } from '@/lib/validations/admin'

const CATEGORIES = [
  { value: 'economy', label: 'Economy' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'education', label: 'Education' },
  { value: 'defense', label: 'Defense' },
  { value: 'environment', label: 'Environment' },
  { value: 'justice', label: 'Justice' },
  { value: 'foreign_policy', label: 'Foreign Policy' },
  { value: 'technology', label: 'Technology' },
  { value: 'social', label: 'Social' },
  { value: 'gun_policy', label: 'Gun Policy' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'housing', label: 'Housing' },
  { value: 'energy', label: 'Energy' },
]

interface Props {
  issue?: {
    id: string
    name: string
    slug: string
    description: string | null
    category: string
    icon: string | null
  }
}

export function IssueForm({ issue }: Props) {
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
      category: form.get('category') as string,
      icon: (form.get('icon') as string) || null,
      description: (form.get('description') as string) || null,
    }

    const result = issueSchema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join(', '))
      setLoading(false)
      return
    }

    const issueData = {
      ...result.data,
      slug: slugify(result.data.name),
    }

    if (issue) {
      const { error: updateError } = await supabase.from('issues').update(issueData).eq('id', issue.id)
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('issues').insert(issueData)
      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push('/admin/issues')
    router.refresh()
  }

  async function handleDelete() {
    if (!issue) return
    if (!confirm('Delete this issue and all politician stances? This cannot be undone.')) return
    setDeleting(true)

    const supabase = createClient()
    await supabase.from('politician_issues').delete().eq('issue_id', issue.id)
    await supabase.from('issues').delete().eq('id', issue.id)

    router.push('/admin/issues')
    router.refresh()
  }

  return (
    <>
      {error && (
        <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" required defaultValue={issue?.name ?? ''} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Icon (Lucide name)</label>
            <input name="icon" defaultValue={issue?.icon ?? ''} placeholder="e.g. briefcase" className={fieldClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Category *</label>
          <select name="category" required defaultValue={issue?.category ?? ''} className={fieldClass}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" rows={4} defaultValue={issue?.description ?? ''} className={fieldClass} />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : issue ? 'Save Changes' : 'Add Issue'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          {issue && (
            <Button type="button" variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
