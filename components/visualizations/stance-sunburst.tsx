'use client'

import { useState, useEffect } from 'react'
import { STANCE_STYLES } from '@/lib/utils/stances'

interface StanceSunburstProps {
  stances: Record<string, number>  // any stance type -> count
  size?: number
}

const SEGMENTS = [
  { key: 'strongly_supports', label: 'Strongly Supports', color: STANCE_STYLES.strongly_supports.color },
  { key: 'supports', label: 'Supports', color: STANCE_STYLES.supports.color },
  { key: 'leans_support', label: 'Leans Support', color: STANCE_STYLES.leans_support.color },
  { key: 'neutral', label: 'Neutral', color: STANCE_STYLES.neutral.color },
  { key: 'mixed', label: 'Mixed', color: STANCE_STYLES.mixed.color },
  { key: 'leans_oppose', label: 'Leans Oppose', color: STANCE_STYLES.leans_oppose.color },
  { key: 'opposes', label: 'Opposes', color: STANCE_STYLES.opposes.color },
  { key: 'strongly_opposes', label: 'Strongly Opposes', color: STANCE_STYLES.strongly_opposes.color },
  { key: 'unknown', label: 'Unknown', color: 'var(--codex-border)' },
]

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

export function StanceSunburst({ stances, size = 120 }: StanceSunburstProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    let frame: number
    const start = performance.now()
    const duration = 800

    function animate(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimationProgress(eased)
      if (t < 1) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  const total = Object.values(stances).reduce((sum, n) => sum + (n || 0), 0)
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-[11px] text-[var(--codex-faint)]">No data</span>
      </div>
    )
  }

  const cx = size / 2
  const cy = size / 2
  const outerR = size / 2 - 4
  const innerR = outerR * 0.6
  const strokeWidth = outerR - innerR
  const midR = (outerR + innerR) / 2

  let currentAngle = 0
  const segmentArcs = SEGMENTS.map((seg) => {
    const value = stances[seg.key] ?? 0
    const angle = (value / total) * 360 * animationProgress
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    return { ...seg, value, startAngle, endAngle, angle }
  }).filter((s) => s.value > 0)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Stance breakdown: ${total} total issues`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={midR}
          fill="none"
          stroke="var(--codex-border)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />

        {/* Segment arcs */}
        {segmentArcs.map((seg) => {
          if (seg.angle < 0.5) return null
          const isHovered = hoveredSegment === seg.key
          const path = describeArc(cx, cy, midR, seg.startAngle, seg.endAngle)

          return (
            <path
              key={seg.key}
              d={path}
              fill="none"
              stroke={seg.color}
              strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
              strokeLinecap="butt"
              opacity={isHovered ? 1 : 0.85}
              className="cursor-default transition-all duration-200"
              onMouseEnter={() => setHoveredSegment(seg.key)}
              onMouseLeave={() => setHoveredSegment(null)}
              onFocus={() => setHoveredSegment(seg.key)}
              onBlur={() => setHoveredSegment(null)}
              tabIndex={0}
              role="button"
              aria-label={`${seg.label}: ${seg.value} issues (${Math.round((seg.value / total) * 100)}%)`}
            />
          )
        })}

        {/* Center text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--codex-text)"
          fontSize={size * 0.18}
          fontFamily="var(--font-sans, sans-serif)"
          fontWeight="400"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + size * 0.1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--codex-faint)"
          fontSize={size * 0.08}
          style={{ letterSpacing: '0.08em' }}
        >
          ISSUES
        </text>
      </svg>

      {/* Hover tooltip */}
      {hoveredSegment && (
        <div
          className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] px-2.5 py-1.5 shadow-lg"
          role="tooltip"
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: SEGMENTS.find((s) => s.key === hoveredSegment)?.color }}
            />
            <span className="text-[11px] text-[var(--codex-text)]">
              {SEGMENTS.find((s) => s.key === hoveredSegment)?.label}:{' '}
              {stances[hoveredSegment] ?? 0}
            </span>
            <span className="text-[10px] text-[var(--codex-faint)]">
              ({Math.round(((stances[hoveredSegment] ?? 0) / total) * 100)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
