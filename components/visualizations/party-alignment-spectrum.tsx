'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { partyColor } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'

interface PoliticianDot {
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  alignment: number
  imageUrl?: string
}

interface PartyAlignmentSpectrumProps {
  politicians: PoliticianDot[]
}

type ChamberFilter = 'all' | 'senate' | 'house'

const SPECTRUM_LABELS = [
  { position: 0, label: 'Goes their own way' },
  { position: 25, label: '' },
  { position: 50, label: 'Sometimes breaks away' },
  { position: 75, label: '' },
  { position: 100, label: 'Always with their party' },
]

export function PartyAlignmentSpectrum({ politicians }: PartyAlignmentSpectrumProps) {
  const [chamber, setChamber] = useState<ChamberFilter>('all')
  const [activeDot, setActiveDot] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const filtered = useMemo(() => {
    if (chamber === 'all') return politicians
    return politicians.filter((p) => p.chamber.toLowerCase() === chamber)
  }, [politicians, chamber])

  // Build density histogram (20 bins)
  const bins = useMemo(() => {
    const binCount = 20
    const counts = new Array(binCount).fill(0)
    filtered.forEach((p) => {
      const bin = Math.min(Math.floor((p.alignment / 100) * binCount), binCount - 1)
      counts[bin]++
    })
    const maxCount = Math.max(...counts, 1)
    return counts.map((c) => c / maxCount)
  }, [filtered])

  // Stack dots that overlap
  const dotPositions = useMemo(() => {
    const width = 100 // percentage
    const dotRadius = 1.2 // percentage of width
    const positions: Map<string, { x: number; y: number }> = new Map()
    const columns: Map<number, number> = new Map()

    // Sort by alignment for consistent stacking
    const sorted = [...filtered].sort((a, b) => a.alignment - b.alignment)

    sorted.forEach((p) => {
      const x = p.alignment
      // Quantize to prevent too much overlap
      const quantized = Math.round(x / (dotRadius * 2)) * (dotRadius * 2)
      const count = columns.get(quantized) ?? 0
      columns.set(quantized, count + 1)
      // Stack upward
      const y = count * (dotRadius * 2.2)
      positions.set(p.slug, { x, y })
    })

    return positions
  }, [filtered])

  const maxStackHeight = useMemo(() => {
    let max = 0
    dotPositions.forEach((pos) => {
      if (pos.y > max) max = pos.y
    })
    return max
  }, [dotPositions])

  const svgWidth = 800
  const svgHeight = 200
  const chartPadding = { top: 20, right: 30, bottom: 40, left: 30 }
  const chartWidth = svgWidth - chartPadding.left - chartPadding.right
  const chartHeight = svgHeight - chartPadding.top - chartPadding.bottom
  const histogramHeight = chartHeight * 0.4
  const dotAreaHeight = chartHeight * 0.55
  const dotAreaY = chartPadding.top
  const histogramY = dotAreaY + dotAreaHeight + 5

  const xScale = (value: number) => chartPadding.left + (value / 100) * chartWidth
  const dotYScale = (stackY: number) => {
    const maxStack = maxStackHeight || 1
    return dotAreaY + dotAreaHeight - (stackY / maxStack) * dotAreaHeight
  }

  return (
    <div className="w-full">
      {/* Chamber filter */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--codex-faint)]">Chamber</span>
        {(['all', 'senate', 'house'] as ChamberFilter[]).map((c) => (
          <button
            key={c}
            onClick={() => setChamber(c)}
            className={`rounded-sm px-2.5 py-1 text-[11px] uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)] ${
              chamber === c
                ? 'bg-[var(--codex-badge-bg)] text-[var(--codex-text)]'
                : 'text-[var(--codex-faint)] hover:text-[var(--codex-sub)]'
            }`}
            aria-pressed={chamber === c}
          >
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[var(--codex-faint)]">
          {filtered.length} officials
        </span>
      </div>

      {/* SVG Spectrum */}
      <div className="overflow-x-auto rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ minWidth: 300 }}
          role="img"
          aria-label="Political alignment spectrum chart"
        >
          {/* Density histogram */}
          {bins.map((height, i) => {
            const binWidth = chartWidth / bins.length
            return (
              <rect
                key={i}
                x={chartPadding.left + i * binWidth}
                y={histogramY + histogramHeight * (1 - height)}
                width={binWidth - 1}
                height={histogramHeight * height}
                fill="var(--codex-border)"
                opacity={0.6}
                rx={1}
              />
            )
          })}

          {/* Axis line */}
          <line
            x1={chartPadding.left}
            y1={histogramY + histogramHeight}
            x2={chartPadding.left + chartWidth}
            y2={histogramY + histogramHeight}
            stroke="var(--codex-border)"
            strokeWidth={1}
          />

          {/* Tick marks and labels */}
          {SPECTRUM_LABELS.map(({ position, label }) => {
            const x = xScale(position)
            return (
              <g key={position}>
                <line
                  x1={x}
                  y1={histogramY + histogramHeight}
                  x2={x}
                  y2={histogramY + histogramHeight + 6}
                  stroke="var(--codex-faint)"
                  strokeWidth={0.5}
                />
                {label && (
                  <text
                    x={x}
                    y={histogramY + histogramHeight + 20}
                    textAnchor="middle"
                    fill="var(--codex-faint)"
                    fontSize={10}
                    fontFamily="var(--font-sans, sans-serif)"
                    style={{ letterSpacing: '0.04em' }}
                  >
                    {label}
                  </text>
                )}
                <text
                  x={x}
                  y={histogramY + histogramHeight + 32}
                  textAnchor="middle"
                  fill="var(--codex-faint)"
                  fontSize={9}
                  opacity={0.6}
                >
                  {position}%
                </text>
              </g>
            )
          })}

          {/* Politician dots */}
          {filtered.map((p) => {
            const pos = dotPositions.get(p.slug)
            if (!pos) return null
            const cx = xScale(pos.x)
            const cy = dotYScale(pos.y)
            const color = partyColor(p.party)
            const isActive = activeDot === p.slug
            const iconSize = isActive ? 14 : 10

            return (
              <g key={p.slug}>
                <foreignObject
                  x={cx - iconSize / 2}
                  y={cy - iconSize / 2}
                  width={iconSize}
                  height={iconSize}
                  className="cursor-pointer overflow-visible"
                  onClick={(e) => { e.preventDefault(); setActiveDot(isActive ? null : p.slug) }}
                  onMouseEnter={() => setActiveDot(p.slug)}
                  onMouseLeave={() => setActiveDot(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.name} (${p.party}, ${p.state}) - ${p.alignment}% alignment`}
                >
                  <Link href={`/politicians/${p.slug}`} tabIndex={-1} className="block">
                    <div
                      className="flex items-center justify-center rounded-full transition-all duration-150"
                      style={{
                        width: iconSize,
                        height: iconSize,
                        backgroundColor: `${color}25`,
                        border: isActive ? `1.5px solid ${color}` : 'none',
                        opacity: isActive ? 1 : 0.85,
                      }}
                    >
                      <PartyIcon party={p.party} size={iconSize * 0.65} />
                    </div>
                  </Link>
                </foreignObject>

                {/* Tooltip */}
                {isActive && (
                  <g>
                    <rect
                      x={cx - 70}
                      y={cy - 52}
                      width={140}
                      height={40}
                      rx={4}
                      fill="var(--codex-card)"
                      stroke="var(--codex-border)"
                      strokeWidth={1}
                      filter="drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
                    />
                    <text
                      x={cx}
                      y={cy - 34}
                      textAnchor="middle"
                      fill="var(--codex-text)"
                      fontSize={11}
                      fontFamily="var(--font-sans, sans-serif)"
                    >
                      {p.name}
                    </text>
                    <text
                      x={cx}
                      y={cy - 20}
                      textAnchor="middle"
                      fill="var(--codex-faint)"
                      fontSize={10}
                    >
                      {p.state} | {p.alignment}% aligned
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Histogram explainer */}
      <p className="mt-2 text-[12px] text-[var(--codex-faint)]">
        Taller bars = more politicians at that score
      </p>

      {/* Party legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {[
          { party: 'democrat', label: 'Democrat' },
          { party: 'republican', label: 'Republican' },
          { party: 'independent', label: 'Independent' },
        ].map(({ party, label }) => (
          <div key={party} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: partyColor(party) }} />
            <span className="text-[11px] text-[var(--codex-faint)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
