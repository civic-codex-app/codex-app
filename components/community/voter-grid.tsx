'use client'

import { useEffect, useState } from 'react'
import { VoterCard } from './voter-card'
import { loadQuizAnswers } from '@/lib/utils/quiz-storage'
import { createClient, getLocalUser } from '@/lib/supabase/client'

interface Voter {
  anonymousId: string
  state: string | null
  stances: Record<string, string>
}

export function VoterGrid({
  voters,
  issues,
}: {
  voters: Voter[]
  issues: Array<{ slug: string; name: string }>
}) {
  const [myStances, setMyStances] = useState<Record<string, string> | null>(null)
  const [myAnonId, setMyAnonId] = useState<string | null>(null)

  useEffect(() => {
    const answers = loadQuizAnswers()
    if (Object.keys(answers).length > 0) {
      setMyStances(answers)
    }

    // Fetch current user's anonymous_id to hide their own card
    // The shared client, not a second createBrowserClient: @supabase/ssr
    // caches one browser instance, and constructing another gives it a rival
    // auth state machine competing for the same Web Locks entry.
    const supabase = createClient()
    getLocalUser(supabase).then(({ data }) => {
      if (data.user) {
        supabase
          .from('profiles')
          .select('anonymous_id')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.anonymous_id) {
              setMyAnonId(profile.anonymous_id)
            }
          })
      }
    })
  }, [])

  const filtered = myAnonId
    ? voters.filter((v) => v.anonymousId !== myAnonId)
    : voters

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((v) => (
        <VoterCard
          key={v.anonymousId}
          anonymousId={v.anonymousId}
          state={v.state}
          stances={v.stances}
          issues={issues}
          myStances={myStances}
        />
      ))}
    </div>
  )
}
