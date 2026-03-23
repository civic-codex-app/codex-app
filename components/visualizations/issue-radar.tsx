'use client'

import { useState, useMemo } from 'react'
import { partyColor } from '@/lib/constants/parties'
import { STANCE_NUMERIC, MAX_STANCE_VALUE, stanceStyle, stanceDisplayBadge } from '@/lib/utils/stances'
import { IssueIcon } from '@/components/icons/issue-icon'

interface PoliticianRadarData {
  name: string
  party: string
  stances: Record<string, string> // issueSlug -> stance type
}

interface IssueAxis {
  slug: string
  name: string
  icon: string
}

interface IssueRadarProps {
  politician1: PoliticianRadarData
  politician2: PoliticianRadarData
  issues: IssueAxis[]
}

const STANCE_VALUES = STANCE_NUMERIC
const MAX_VALUE = MAX_STANCE_VALUE
const RINGS = [2, 4, 6]  // Show 3 concentric rings at key levels

export function IssueRadar({ politician1, politician2, issues }: IssueRadarProps) {
  const [activeAxis, setActiveAxis] = useState<string | null>(null)
  const [hoveredPolitician, setHoveredPolitician] = useState<1 | 2 | null>(null)

  const size = 550
  const cx = size / 2
  const cy = size / 2
  const maxRadius = size * 0.28
  const labelRadius = size * 0.38

  const angleStep = (2 * Math.PI) / issues.length
  const startAngle = -Math.PI / 2 // Start from top

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep
    const r = (value / MAX_VALUE) * maxRadius
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }

  const getLabelPoint = (index: number) => {
    const angle = startAngle + index * angleStep
    return {
      x: cx + labelRadius * Math.cos(angle),
      y: cy + labelRadius * Math.sin(angle),
    }
  }

  const buildPolygonPoints = (stances: Record<string, string>) => {
    return issues
      .map((issue, i) => {
        const stance = stances[issue.slug] ?? 'unknown'
        const value = STANCE_VALUES[stance] ?? 0
        const pt = getPoint(i, value)
        return `${pt.x},${pt.y}`
      })
      .join(' ')
  }

  const color1 = partyColor(politician1.party)
  const color2 = partyColor(politician2.party)

  const polygon1 = useMemo(() => buildPolygonPoints(politician1.stances), [politician1.stances, issues])
  const polygon2 = useMemo(() => buildPolygonPoints(politician2.stances), [politician2.stances, issues])

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-6">
        <button
          className="flex items-center gap-2 rounded-sm px-2 py-1 transition-colors hover:bg-[var(--codex-hover)]"
          onMouseEnter={() => setHoveredPolitician(1)}
          onMouseLeave={() => setHoveredPolitician(null)}
          aria-label={`Highlight ${politician1.name}`}
        >
          <div className="h-3 w-3 rounded-sm" style={{ background: color1, opacity: 0.8 }} />
          <span className="text-[13px] font-semibold" style={{ color: color1 }}>
            {politician1.name}
          </span>
        </button>
        <button
          className="flex items-center gap-2 rounded-sm px-2 py-1 transition-colors hover:bg-[var(--codex-hover)]"
          onMouseEnter={() => setHoveredPolitician(2)}
          onMouseLeave={() => setHoveredPolitician(null)}
          aria-label={`Highlight ${politician2.name}`}
        >
          <div className="h-3 w-3 rounded-sm" style={{ background: color2, opacity: 0.8 }} />
          <span className="text-[13px] font-semibold" style={{ color: color2 }}>
            {politician2.name}
          </span>
        </button>
      </div>

      {/* Radar SVG */}
      <div className="flex justify-center overflow-x-auto">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full"
          style={{ maxWidth: size, minWidth: 300 }}
          role="img"
          aria-label={`Radar chart comparing ${politician1.name} and ${politician2.name} across ${issues.length} issues`}
        >
          {/* Concentric ring backgrounds */}
          {RINGS.map((ring) => {
            const r = (ring / MAX_VALUE) * maxRadius
            const points = issues
              .map((_, i) => {
                const angle = startAngle + i * angleStep
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
              })
              .join(' ')

            return (
              <polygon
                key={ring}
                points={points}
                fill="none"
                stroke="var(--codex-border)"
                strokeWidth={ring === MAX_VALUE ? 1 : 0.5}
                opacity={0.6}
              />
            )
          })}

          {/* Axis lines */}
          {issues.map((issue, i) => {
            const pt = getPoint(i, MAX_VALUE)
            const isHovered = activeAxis === issue.slug
            return (
              <line
                key={issue.slug}
                x1={cx}
                y1={cy}
                x2={pt.x}
                y2={pt.y}
                stroke="var(--codex-border)"
                strokeWidth={isHovered ? 1.5 : 0.5}
                opacity={isHovered ? 1 : 0.4}
              />
            )
          })}

          {/* Politician 1 polygon */}
          <polygon
            points={polygon1}
            fill={color1}
            fillOpacity={hoveredPolitician === 2 ? 0.05 : 0.15}
            stroke={color1}
            strokeWidth={hoveredPolitician === 2 ? 0.5 : 2}
            strokeLinejoin="round"
            opacity={hoveredPolitician === 2 ? 0.3 : 0.9}
            className="transition-all duration-300"
          />

          {/* Politician 2 polygon */}
          <polygon
            points={polygon2}
            fill={color2}
            fillOpacity={hoveredPolitician === 1 ? 0.05 : 0.15}
            stroke={color2}
            strokeWidth={hoveredPolitician === 1 ? 0.5 : 2}
            strokeLinejoin="round"
            opacity={hoveredPolitician === 1 ? 0.3 : 0.9}
            className="transition-all duration-300"
          />

          {/* Data points for politician 1 */}
          {issues.map((issue, i) => {
            const stance = politician1.stances[issue.slug] ?? 'unknown'
            const value = STANCE_VALUES[stance] ?? 0
            const pt = getPoint(i, value)
            return (
              <circle
                key={`p1-${issue.slug}`}
                cx={pt.x}
                cy={pt.y}
                r={hoveredPolitician === 2 ? 2 : 3.5}
                fill={color1}
                stroke="var(--codex-card)"
                strokeWidth={1}
                opacity={hoveredPolitician === 2 ? 0.3 : 1}
                className="transition-all duration-300"
              />
            )
          })}

          {/* Data points for politician 2 */}
          {issues.map((issue, i) => {
            const stance = politician2.stances[issue.slug] ?? 'unknown'
            const value = STANCE_VALUES[stance] ?? 0
            const pt = getPoint(i, value)
            return (
              <circle
                key={`p2-${issue.slug}`}
                cx={pt.x}
                cy={pt.y}
                r={hoveredPolitician === 1 ? 2 : 3.5}
                fill={color2}
                stroke="var(--codex-card)"
                strokeWidth={1}
                opacity={hoveredPolitician === 1 ? 0.3 : 1}
                className="transition-all duration-300"
              />
            )
          })}

          {/* Axis labels (icons + short names) */}
          {issues.map((issue, i) => {
            const pt = getLabelPoint(i)
            const isHovered = activeAxis === issue.slug

            // Determine text anchor based on position
            const angle = startAngle + i * angleStep
            const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
            let textAnchor: 'start' | 'middle' | 'end' = 'middle'
            if (normAngle > Math.PI * 0.1 && normAngle < Math.PI * 0.9) textAnchor = 'start'
            if (normAngle > Math.PI * 1.1 && normAngle < Math.PI * 1.9) textAnchor = 'end'

            return (
              <g
                key={issue.slug}
                onClick={() => setActiveAxis(activeAxis === issue.slug ? null : issue.slug)}
                onMouseEnter={() => setActiveAxis(issue.slug)}
                onMouseLeave={() => setActiveAxis(null)}
                className="cursor-pointer"
              >
                <foreignObject
                  x={textAnchor === 'end' ? pt.x - 20 : textAnchor === 'start' ? pt.x : pt.x - 10}
                  y={pt.y - 20}
                  width={20}
                  height={20}
                  className="pointer-events-none"
                >
                  <div
                    className="flex h-full w-full items-center transition-colors duration-150"
                    style={{
                      color: isHovered ? 'var(--codex-text)' : 'var(--codex-sub)',
                      justifyContent: textAnchor === 'end' ? 'flex-end' : textAnchor === 'start' ? 'flex-start' : 'center',
                    }}
                  >
                    <IssueIcon icon={issue.icon} size={14} />
                  </div>
                </foreignObject>
                <text
                  x={pt.x}
                  y={pt.y + 8}
                  textAnchor={textAnchor}
                  fill={isHovered ? 'var(--codex-text)' : 'var(--codex-faint)'}
                  fontSize={9}
                  fontFamily="var(--font-sans)"
                  style={{ letterSpacing: '0.02em' }}
                  className="transition-colors duration-150"
                >
                  {issue.name}
                </text>

                {/* Hover detail */}
                {isHovered && (
                  <>
                    <rect
                      x={pt.x - 65}
                      y={pt.y + 14}
                      width={130}
                      height={32}
                      rx={4}
                      fill="var(--codex-card)"
                      stroke="var(--codex-border)"
                    />
                    <text x={pt.x} y={pt.y + 27} textAnchor="middle" fontSize={9} fill={color1}>
                      {politician1.name.split(' ').pop()}: {stanceDisplayBadge(politician1.stances[issue.slug] ?? 'unknown').label}
                    </text>
                    <text x={pt.x} y={pt.y + 40} textAnchor="middle" fontSize={9} fill={color2}>
                      {politician2.name.split(' ').pop()}: {stanceDisplayBadge(politician2.stances[issue.slug] ?? 'unknown').label}
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {/* Ring labels */}
          {RINGS.map((ring) => {
            const r = (ring / MAX_VALUE) * maxRadius
            const labels: Record<number, string> = { 2: 'Opposes', 4: 'Leans', 6: 'Strongly Favors' }
            return (
              <text
                key={ring}
                x={cx + 4}
                y={cy - r + 3}
                fill="var(--codex-faint)"
                fontSize={8}
                opacity={0.5}
              >
                {labels[ring] ?? ''}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
