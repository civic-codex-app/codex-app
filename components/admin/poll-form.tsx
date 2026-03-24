'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { fieldClass, labelClass } from '@/lib/utils'
import { pollSchema } from '@/lib/validations/admin'

interface PollOption {
  id?: string
  label: string
  sort_order: number
}

interface Props {
  poll?: {
    id: string
    title: string
    description: string | null
    poll_type: string
    status: string
    ends_at: string | null
    poll_options: PollOption[]
  }
}

export function PollForm({ poll }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [options, setOptions] = useState<PollOption[]>(
    poll?.poll_options?.sort((a, b) => a.sort_order - b.sort_order) ?? [
      { label: '', sort_order: 0 },
      { label: '', sort_order: 1 },
    ]
  )

  function addOption() {
    setOptions((prev) => [...prev, { label: '', sort_order: prev.length }])
  }

  function removeOption(index: number) {
    if (options.length <= 2) return
    setOptions((prev) => prev.filter((_, i) => i !== index).map((o, i) => ({ ...o, sort_order: i })))
  }

  function updateOption(index: number, label: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, label } : o)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const emptyOptions = options.filter((o) => !o.label.trim())
    if (emptyOptions.length > 0) {
      setError('All options must have a label')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const form = new FormData(e.currentTarget)

    const data = {
      title: form.get('title') as string,
      description: (form.get('description') as string) || null,
      poll_type: form.get('poll_type') as string,
      status: form.get('status') as string,
      ends_at: (form.get('ends_at') as string) || undefined,
    }

    const result = pollSchema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join(', '))
      setLoading(false)
      return
    }

    const pollData = {
      ...result.data,
      ends_at: result.data.ends_at || null,
    }

    if (poll) {
      // Update existing poll
      const { error: updateError } = await supabase
        .from('polls')
        .update(pollData)
        .eq('id', poll.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      // Delete removed options (only those without votes ideally, but for admin we allow it)
      const existingIds = options.filter((o) => o.id).map((o) => o.id!)
      if (poll.poll_options.length > 0) {
        const removedIds = poll.poll_options.filter((o) => o.id && !existingIds.includes(o.id)).map((o) => o.id!)
        if (removedIds.length > 0) {
          await supabase.from('poll_options').delete().in('id', removedIds)
        }
      }

      // Upsert options
      for (const opt of options) {
        if (opt.id) {
          await supabase.from('poll_options').update({ label: opt.label, sort_order: opt.sort_order }).eq('id', opt.id)
        } else {
          await supabase.from('poll_options').insert({ poll_id: poll.id, label: opt.label, sort_order: opt.sort_order })
        }
      }
    } else {
      // Create new poll
      const { data: newPoll, error: insertError } = await supabase
        .from('polls')
        .insert(pollData)
        .select('id')
        .single()

      if (insertError || !newPoll) {
        setError(insertError?.message ?? 'Failed to create poll')
        setLoading(false)
        return
      }

      // Insert options
      const { error: optError } = await supabase.from('poll_options').insert(
        options.map((opt) => ({
          poll_id: newPoll.id,
          label: opt.label,
          sort_order: opt.sort_order,
        }))
      )

      if (optError) {
        setError(optError.message)
        setLoading(false)
        return
      }
    }

    router.push('/admin/polls')
    router.refresh()
  }

  async function handleDelete() {
    if (!poll) return
    if (!confirm('Delete this poll and all its votes? This cannot be undone.')) return
    setDeleting(true)

    const supabase = createClient()
    await supabase.from('poll_votes').delete().eq('poll_id', poll.id)
    await supabase.from('poll_options').delete().eq('poll_id', poll.id)
    await supabase.from('polls').delete().eq('id', poll.id)

    router.push('/admin/polls')
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
          <label htmlFor="poll-title" className={labelClass}>Title *</label>
          <input id="poll-title" name="title" required defaultValue={poll?.title ?? ''} className={fieldClass} />
        </div>

        <div>
          <label htmlFor="poll-description" className={labelClass}>Description</label>
          <textarea id="poll-description" name="description" rows={3} defaultValue={poll?.description ?? ''} className={fieldClass} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="poll-type" className={labelClass}>Type *</label>
            <select id="poll-type" name="poll_type" required defaultValue={poll?.poll_type ?? 'approval'} className={fieldClass}>
              <option value="approval">Approval</option>
              <option value="matchup">Matchup</option>
              <option value="issue">Issue</option>
            </select>
          </div>
          <div>
            <label htmlFor="poll-status" className={labelClass}>Status *</label>
            <select id="poll-status" name="status" required defaultValue={poll?.status ?? 'active'} className={fieldClass}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label htmlFor="poll-ends-at" className={labelClass}>Ends At</label>
            <input
              id="poll-ends-at"
              name="ends_at"
              type="date"
              defaultValue={poll?.ends_at ? poll.ends_at.split('T')[0] : ''}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className={labelClass}>Options *</label>
            <button
              type="button"
              onClick={addOption}
              className="text-[11px] text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
            >
              + Add Option
            </button>
          </div>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-center text-[11px] text-[var(--codex-faint)]">{i + 1}</span>
                <input
                  value={opt.label}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  aria-label={`Poll option ${i + 1}`}
                  className={`flex-1 ${fieldClass}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    aria-label={`Remove option ${i + 1}`}
                    className="px-2 text-sm text-[var(--codex-faint)] hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : poll ? 'Save Changes' : 'Create Poll'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          {poll && (
            <Button type="button" variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
