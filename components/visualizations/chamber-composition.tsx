'use client'

import { useState, useEffect, useMemo } from 'react'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'

interface SeatGroup {
  party: string
  count: number
}

interface ChamberCompositionProps {
  seats: SeatGroup[]
  chamber: string
  total: number
}

interface Dot {
  x: number
  y: number
  party: string
  index: number
}

export function ChamberComposition({ seats, chamber, total }: ChamberCompositionProps) {
  const [animatedCount, setAnimatedCount] = useState(0)
  const [activeParty, setActiveParty] = useState<string | null>(null)

  // Sort seats by count descending for consistent layout
  const sortedSeats = useMemo(() => [...seats].sort((a, b) => b.count - a.count), [seats])

  // Build flat array of party assignments for each seat
  const seatAssignments = useMemo(() => {
    const assignments: string[] = []
    sortedSeats.forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        assignments.push(group.party)
      }
    })
    return assignments
  }, [sortedSeats])

  // Arrange dots in a semicircle / hemicycle pattern
  const dots = useMemo(() => {
    const result: Dot[] = []
    const totalDots = seatAssignments.length
    if (totalDots === 0) return result

    // Determine number of rows based on total seats
    const numRows = totalDots > 200 ? 8 : totalDots > 100 ? 6 : totalDots > 50 ? 5 : totalDots > 20 ? 4 : 3

    const svgWidth = 400
    const svgHeight = 220
    const centerX = svgWidth / 2
    const centerY = svgHeight - 20
    const minRadius = 60
    const maxRadius = svgHeight - 40
    const radiusStep = (maxRadius - minRadius) / Math.max(numRows - 1, 1)

    // Distribute seats across rows (more seats in outer rows)
    const rowSeats: number[] = []
    let remaining = totalDots
    for (let row = 0; row < numRows; row++) {
      const radius = minRadius + row * radiusStep
      const circumference = Math.PI * radius
      const maxInRow = Math.floor(circumference / 9) // dot spacing
      const proportion = radius / (numRows * (minRadius + maxRadius) / 2)
      let seatsInRow = Math.round(totalDots * proportion)
      seatsInRow = Math.min(seatsInRow, remaining, maxInRow)
      if (row === numRows - 1) seatsInRow = remaining
      rowSeats.push(seatsInRow)
      remaining -= seatsInRow
    }

    let seatIndex = 0
    for (let row = 0; row < numRows; row++) {
      const radius = minRadius + row * radiusStep
      const count = rowSeats[row]
      if (count === 0) continue

      const angleRange = Math.PI * 0.92 // slightly less than full semicircle
      const startAngle = (Math.PI - angleRange) / 2
      const step = count > 1 ? angleRange / (count - 1) : 0

      for (let i = 0; i < count; i++) {
        const angle = count > 1 ? Math.PI - startAngle - i * step : Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY - radius * Math.sin(angle)
        result.push({
          x,
          y,
          party: seatAssignments[seatIndex] ?? 'independent',
          index: seatIndex,
        })
        seatIndex++
      }
    }

    return result
  }, [seatAssignments])

  // Animate dots appearing
  useEffect(() => {
    if (dots.length === 0) return
    let frame: number
    const start = performance.now()
    const duration = 1200

    function animate(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 2)
      setAnimatedCount(Math.floor(eased * dots.length))
      if (t < 1) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [dots.length])

  // Find majority
  const majority = sortedSeats[0]
  const majorityThreshold = Math.floor(total / 2) + 1
  const margin = majority ? majority.count - majorityThreshold : 0

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-[var(--codex-text)]">{chamber}</h3>
        <span className="text-[28px] font-bold text-[var(--codex-text)]">{total}</span>
      </div>

      {/* SVG hemicycle */}
      <div className="overflow-hidden rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-3">
        <svg
          viewBox="0 0 400 220"
          className="w-full"
          role="img"
          aria-label={`${chamber} composition: ${sortedSeats.map((s) => `${partyLabel(s.party)} ${s.count}`).join(', ')}`}
        >
          {dots.map((dot, i) => {
            const show = i < animatedCount
            const isActive = activeParty === null || activeParty === dot.party
            const iconSize = dots.length > 200 ? 6 : dots.length > 100 ? 7 : 8

            return (
              <foreignObject
                key={i}
                x={dot.x - iconSize / 2}
                y={dot.y - iconSize / 2}
                width={iconSize}
                height={iconSize}
                opacity={show ? (isActive ? 0.9 : 0.12) : 0}
                className="transition-opacity duration-200"
              >
                <PartyIcon party={dot.party} size={iconSize} />
              </foreignObject>
            )
          })}
        </svg>
      </div>

      {/* Party breakdown */}
      <div className="mt-3 flex flex-wrap gap-3">
        {sortedSeats.map((group) => {
          const color = partyColor(group.party)
          const isActive = activeParty === group.party

          return (
            <button
              key={group.party}
              onClick={() => setActiveParty(isActive ? null : group.party)}
              className={`flex items-center gap-2 rounded-sm px-2.5 py-1.5 transition-all ${
                isActive
                  ? 'bg-[var(--codex-badge-bg)]'
                  : 'hover:bg-[var(--codex-hover)]'
              }`}
              aria-pressed={isActive}
              aria-label={`${partyLabel(group.party)}: ${group.count} seats`}
            >
              <PartyIcon party={group.party} size={12} />
              <span className="text-[12px] font-semibold" style={{ color }}>
                {group.count}
              </span>
              <span className="text-[11px] text-[var(--codex-faint)]">
                {partyLabel(group.party)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Majority info */}
      {majority && (
        <div className="mt-2 text-[11px] text-[var(--codex-faint)]">
          <span style={{ color: partyColor(majority.party) }}>
            {partyLabel(majority.party)}
          </span>
          {margin > 0
            ? ` is in charge \u2014 they have ${margin} more seats than they need`
            : ' majority'}
          <div className="mt-0.5">They need {majorityThreshold} seats to be in charge</div>
        </div>
      )}
    </div>
  )
}
