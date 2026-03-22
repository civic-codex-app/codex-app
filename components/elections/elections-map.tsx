'use client'

import { useRouter } from 'next/navigation'
import { USMap, STATE_NAMES } from '@/components/visualizations/us-map'

interface StateElection {
  slug: string
  stateCode: string
  raceCount: number
  hasSenate: boolean
  hasGovernor: boolean
}

interface Props {
  stateElections: StateElection[]
}

export function ElectionsMap({ stateElections }: Props) {
  const router = useRouter()

  const stateData: Record<string, { value: number; label?: string; color?: string }> = {}

  for (const el of stateElections) {
    const chips: string[] = []
    if (el.hasSenate) chips.push('Senate')
    if (el.hasGovernor) chips.push('Gov')
    chips.push(el.raceCount + ' races')

    // Color by number of races — more races = darker
    const intensity = Math.min(el.raceCount / 60, 1)
    const r = Math.round(59 + (1 - intensity) * 196)
    const g = Math.round(130 + (1 - intensity) * 125)
    const b = Math.round(246 + (1 - intensity) * 9)

    stateData[el.stateCode] = {
      value: el.raceCount,
      label: chips.join(' · '),
      color: `rgb(${r}, ${g}, ${b})`,
    }
  }

  function handleClick(stateCode: string) {
    const el = stateElections.find(e => e.stateCode === stateCode)
    if (el) router.push(`/elections/${el.slug}`)
  }

  return (
    <div>
      <p className="mb-2 text-center text-[12px] text-[var(--codex-faint)]">
        Click a state to see its races
      </p>
      <USMap
        stateData={stateData}
        onStateClick={handleClick}
      />
    </div>
  )
}
