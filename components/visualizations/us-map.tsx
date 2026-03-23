'use client'

import { useState, useCallback } from 'react'
import { STATE_PATHS, MAP_VIEWBOX } from '@/lib/data/us-state-paths'

export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii',
  ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska',
  NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

interface USMapProps {
  stateData: Record<string, { value: number; label?: string; color?: string }>
  onStateClick?: (stateCode: string) => void
  colorScale?: (value: number) => string
  legend?: Array<{ color: string; label: string }>
}

export function USMap({ stateData, onStateClick, colorScale, legend }: USMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const getFill = (code: string) => {
    const data = stateData[code]
    if (!data) return 'var(--codex-hover)'
    if (data.color) return data.color
    if (colorScale) return colorScale(data.value)
    return 'var(--codex-hover)'
  }

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      <svg
        viewBox={MAP_VIEWBOX}
        className="w-full"
        role="img"
        aria-label="US map"
      >
        {Object.entries(STATE_PATHS).map(([code, d]) => {
          const isHovered = hovered === code
          // Scale up AK and HI and push them to the far left
          // Make AK/HI bigger, push left and up
          const transform =
            code === 'AK' ? 'translate(-70, -50) scale(1.3)' :
            code === 'HI' ? 'translate(-100, -40) scale(1.3)' :
            undefined
          return (
            <g key={code} transform={transform}>
              <path
                d={d}
                fill={getFill(code)}
                stroke="var(--codex-border)"
                strokeWidth={isHovered ? 1.2 : 0.5}
                opacity={hovered && !isHovered ? 0.6 : 1}
                className="cursor-pointer transition-opacity duration-150"
                onMouseEnter={() => setHovered(code)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { setHovered(code); onStateClick?.(code) }}
                role="button"
                tabIndex={0}
                aria-label={STATE_NAMES[code] ?? code}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onStateClick?.(code)
                  }
                }}
              />
            </g>
          )
        })}
      </svg>

      {/* Tooltip — follows mouse on desktop, fixed bar on mobile */}
      {hovered && tooltipPos && (
        <div
          className="pointer-events-none absolute z-10 hidden rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] px-3 py-1.5 shadow-lg sm:block"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 30,
          }}
        >
          <div className="text-[12px] font-medium text-[var(--codex-text)]">
            {STATE_NAMES[hovered] ?? hovered}
          </div>
          {stateData[hovered]?.label && (
            <div className="text-[11px] text-[var(--codex-sub)]">
              {stateData[hovered].label}
            </div>
          )}
        </div>
      )}

      {/* Mobile info bar — tap a state to see details */}
      {hovered && (
        <div className="mt-2 rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] px-3 py-2 text-center sm:hidden">
          <span className="text-[13px] font-medium text-[var(--codex-text)]">{STATE_NAMES[hovered] ?? hovered}</span>
          {stateData[hovered]?.label && (
            <span className="ml-2 text-[12px] text-[var(--codex-sub)]">{stateData[hovered].label}</span>
          )}
        </div>
      )}
      {!hovered && (
        <p className="mt-2 text-center text-[11px] text-[var(--codex-faint)] sm:hidden">
          Tap a state to see details
        </p>
      )}

      {/* Legend */}
      {legend && legend.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[var(--codex-sub)]">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
