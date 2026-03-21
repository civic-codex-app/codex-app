'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  pollId: string
  currentStatus: string
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400',
  closed: 'bg-red-500/10 text-red-400',
  draft: 'bg-yellow-500/10 text-yellow-400',
}

const NEXT_STATUS: Record<string, string> = {
  active: 'closed',
  closed: 'active',
  draft: 'active',
}

const TOGGLE_LABELS: Record<string, string> = {
  active: 'Close',
  closed: 'Reopen',
  draft: 'Activate',
}

export function PollStatusToggle({ pollId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  async function toggle() {
    const nextStatus = NEXT_STATUS[status]
    if (!nextStatus) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('polls')
      .update({ status: nextStatus })
      .eq('id', pollId)

    if (!error) {
      setStatus(nextStatus)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${STATUS_STYLES[status] ?? ''}`}
      >
        {status}
      </span>
      <button
        onClick={toggle}
        disabled={loading}
        className="text-[10px] text-[var(--codex-faint)] hover:text-[var(--codex-text)] disabled:opacity-50"
      >
        {loading ? '...' : TOGGLE_LABELS[status] ?? ''}
      </button>
    </div>
  )
}
