'use client'

import { useRouter } from 'next/navigation'
import { USMap } from '@/components/visualizations/us-map'

interface StateElection {
  slug: string
  stateCode: string
  raceCount: number
  hasSenate: boolean
  hasGovernor: boolean
  demCount: number
  gopCount: number
}

interface Props {
  stateElections: StateElection[]
}

/** Blend between blue (#2563EB) and red (#DC2626) based on ratio */
function leanColor(demCount: number, gopCount: number): string {
  const total = demCount + gopCount
  if (total === 0) return '#9CA3AF' // gray for no data

  const demRatio = demCount / total // 0 = all GOP, 1 = all Dem

  // Pure blue at 1.0, purple at 0.5, pure red at 0.0
  if (demRatio > 0.55) {
    // Blue range — deeper blue as more Dem
    const t = (demRatio - 0.55) / 0.45
    const r = Math.round(96 - t * 59)   // 96 → 37
    const g = Math.round(165 - t * 66)  // 165 → 99
    const b = Math.round(235 + t * 20)  // 235 → 255
    return `rgb(${r}, ${g}, ${b})`
  } else if (demRatio < 0.45) {
    // Red range — deeper red as more GOP
    const t = (0.45 - demRatio) / 0.45
    const r = Math.round(235 + t * 20)  // 235 → 255
    const g = Math.round(96 - t * 58)   // 96 → 38
    const b = Math.round(96 - t * 58)   // 96 → 38
    return `rgb(${r}, ${g}, ${b})`
  } else {
    // Purple middle — roughly even
    return '#8B5CF6'
  }
}

export function ElectionsMap({ stateElections }: Props) {
  const router = useRouter()

  const stateData: Record<string, { value: number; label?: string; color?: string }> = {}

  for (const el of stateElections) {
    const chips: string[] = []
    if (el.hasSenate) chips.push('Senate')
    if (el.hasGovernor) chips.push('Gov')
    chips.push(el.raceCount + ' races')

    const total = el.demCount + el.gopCount
    if (total > 0) {
      const demPct = Math.round((el.demCount / total) * 100)
      chips.push(demPct + '% Dem')
    }

    stateData[el.stateCode] = {
      value: el.raceCount,
      label: chips.join(' · '),
      color: leanColor(el.demCount, el.gopCount),
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
      <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-[var(--codex-faint)]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#2563EB' }} />
          Leans Blue
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#8B5CF6' }} />
          Mixed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#DC2626' }} />
          Leans Red
        </div>
      </div>
    </div>
  )
}
