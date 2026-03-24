'use client'

import { useEffect, useState } from 'react'
import { VoterCard } from './voter-card'
import { loadQuizAnswers } from '@/lib/utils/quiz-storage'

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

  useEffect(() => {
    const answers = loadQuizAnswers()
    if (Object.keys(answers).length > 0) {
      setMyStances(answers)
    }
  }, [])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {voters.map((v) => (
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
