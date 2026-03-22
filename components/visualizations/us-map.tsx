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
          return (
            <path
              key={code}
              d={d}
              fill={getFill(code)}
              stroke="var(--codex-border)"
              strokeWidth={isHovered ? 1.2 : 0.5}
              opacity={hovered && !isHovered ? 0.6 : 1}
              className="cursor-pointer transition-opacity duration-150"
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onStateClick?.(code)}
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
          )
        })}
      </svg>

      {/* Tooltip */}
      {hovered && tooltipPos && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] px-3 py-1.5 shadow-lg"
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
