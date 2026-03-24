'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { fieldClass, labelClass } from '@/lib/utils'
import { billSchema } from '@/lib/validations/admin'

const STATUSES = [
  'Introduced',
  'In Committee',
  'Passed House',
  'Passed Senate',
  'Passed Both',
  'Signed into Law',
  'Vetoed',
  'Failed',
  'Tabled',
]

interface Props {
  bill?: {
    id: string
    number: string
    title: string
    summary: string | null
    status: string | null
    introduced_date: string | null
    last_action_date: string | null
    congress_session: string | null
  }
}

export function BillForm({ bill }: Props) {
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
      number: form.get('number') as string,
      title: form.get('title') as string,
      summary: (form.get('summary') as string) || null,
      status: (form.get('status') as string) || null,
      introduced_date: (form.get('introduced_date') as string) || undefined,
      last_action_date: (form.get('last_action_date') as string) || undefined,
      congress_session: (form.get('congress_session') as string) || null,
    }

    const result = billSchema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join(', '))
      setLoading(false)
      return
    }

    const billData = {
      ...result.data,
      introduced_date: result.data.introduced_date || null,
      last_action_date: result.data.last_action_date || null,
    }

    if (bill) {
      const { error: updateError } = await supabase
        .from('bills')
        .update(billData)
        .eq('id', bill.id)
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('bills').insert(billData)
      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push('/admin/bills')
    router.refresh()
  }

  async function handleDelete() {
    if (!bill) return
    if (!confirm('Delete this bill? Associated voting records will have their bill_id set to null.')) return
    setDeleting(true)

    const supabase = createClient()
    await supabase.from('bills').delete().eq('id', bill.id)

    router.push('/admin/bills')
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
            <label htmlFor="bill-number" className={labelClass}>Bill Number *</label>
            <input
              id="bill-number"
              name="number"
              required
              placeholder="e.g. H.R. 1234"
              defaultValue={bill?.number ?? ''}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="bill-congress-session" className={labelClass}>Congress Session</label>
            <input
              id="bill-congress-session"
              name="congress_session"
              placeholder="e.g. 119th"
              defaultValue={bill?.congress_session ?? ''}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="bill-title" className={labelClass}>Title *</label>
          <input id="bill-title" name="title" required defaultValue={bill?.title ?? ''} className={fieldClass} />
        </div>

        <div>
          <label htmlFor="bill-summary" className={labelClass}>Summary</label>
          <textarea id="bill-summary" name="summary" rows={4} defaultValue={bill?.summary ?? ''} className={fieldClass} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="bill-status" className={labelClass}>Status</label>
            <select id="bill-status" name="status" defaultValue={bill?.status ?? ''} className={fieldClass}>
              <option value="">Select status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bill-introduced-date" className={labelClass}>Introduced Date</label>
            <input
              id="bill-introduced-date"
              name="introduced_date"
              type="date"
              defaultValue={bill?.introduced_date ? bill.introduced_date.split('T')[0] : ''}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="bill-last-action-date" className={labelClass}>Last Action Date</label>
            <input
              id="bill-last-action-date"
              name="last_action_date"
              type="date"
              defaultValue={bill?.last_action_date ? bill.last_action_date.split('T')[0] : ''}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : bill ? 'Save Changes' : 'Add Bill'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          {bill && (
            <Button type="button" variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
