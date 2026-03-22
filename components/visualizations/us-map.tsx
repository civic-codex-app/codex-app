'use client'

import { useState, useCallback } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface USMapProps {
  stateData: Record<string, { value: number; label?: string; color?: string }>
  onStateClick?: (stateCode: string) => void
  colorScale?: (value: number) => string
  title?: string
  legend?: Array<{ color: string; label: string }>
}

/* ------------------------------------------------------------------ */
/*  State metadata: names + abbreviations                              */
/* ------------------------------------------------------------------ */

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'Washington D.C.',
}

/* ------------------------------------------------------------------ */
/*  SVG path data — Albers USA projection, viewBox 0 0 960 600        */
/*  Derived from US Census / Natural Earth public-domain geometries    */
/* ------------------------------------------------------------------ */

const STATE_PATHS: Record<string, string> = {
  AL: 'M628,436 L629,389 L630,372 L614,370 L612,371 L607,404 L604,437 L605,453 L609,456 L612,464 L616,464 L617,461 L620,461 L628,447 Z',
  AK: 'M161,485 L183,485 L184,493 L179,501 L172,506 L163,505 L155,500 L150,494 L147,488 L147,482 L153,478 L161,480 Z M120,495 L128,491 L134,495 L139,501 L136,508 L127,510 L120,506 Z M80,502 L92,497 L101,502 L104,510 L99,517 L89,519 L80,514 Z',
  AZ: 'M205,432 L205,378 L216,374 L236,370 L249,416 L252,432 L255,455 L207,455 L203,449 Z',
  AR: 'M574,404 L574,369 L549,370 L540,371 L540,404 L541,413 L574,412 Z',
  CA: 'M122,348 L127,310 L136,278 L148,253 L155,243 L161,246 L167,262 L175,288 L183,306 L193,329 L198,346 L202,370 L205,392 L205,432 L203,449 L193,448 L172,438 L156,425 L142,408 L131,388 L124,368 Z',
  CO: 'M319,296 L319,340 L381,340 L382,296 Z',
  CT: 'M852,195 L869,189 L873,193 L873,205 L865,213 L853,213 L849,206 Z',
  DE: 'M817,285 L822,275 L825,268 L824,260 L818,258 L812,270 L814,280 Z',
  FL: 'M664,455 L680,446 L700,442 L718,441 L728,444 L732,452 L730,463 L720,477 L706,492 L690,504 L676,507 L665,502 L656,494 L653,484 L634,474 L626,466 L627,455 L635,449 L648,448 Z',
  GA: 'M665,386 L665,422 L664,445 L664,455 L648,448 L635,449 L627,447 L628,436 L628,408 L629,389 L630,372 L640,370 L658,370 L665,371 Z',
  HI: 'M260,515 L270,510 L278,513 L281,520 L275,527 L266,528 L259,523 Z M285,505 L292,500 L299,504 L299,512 L292,516 L285,512 Z',
  ID: 'M232,164 L239,156 L247,164 L255,172 L259,190 L258,215 L256,240 L242,240 L229,241 L227,210 L224,192 L228,176 Z',
  IL: 'M608,260 L608,290 L611,310 L614,330 L611,349 L604,352 L597,346 L590,333 L586,316 L584,296 L585,272 L589,260 L598,255 Z',
  IN: 'M636,264 L636,300 L634,325 L630,345 L621,348 L614,340 L611,320 L608,296 L608,268 L615,260 L628,260 Z',
  IA: 'M537,242 L537,280 L580,280 L585,272 L584,248 L578,238 L558,236 Z',
  KS: 'M435,332 L435,370 L508,370 L510,336 L509,332 Z',
  KY: 'M633,345 L664,336 L685,330 L698,326 L699,340 L688,352 L673,358 L650,362 L633,367 L621,369 L614,362 L614,352 L622,348 Z',
  LA: 'M574,412 L574,440 L578,456 L589,462 L598,458 L605,453 L604,437 L596,437 L582,440 L574,440 L565,450 L558,452 L548,448 L540,440 L540,413 Z',
  ME: 'M882,116 L890,106 L897,110 L900,120 L898,135 L893,150 L885,158 L878,156 L872,148 L870,136 L874,124 Z',
  MD: 'M790,284 L812,270 L818,258 L824,260 L825,268 L825,280 L816,290 L802,296 L790,296 Z M780,280 L778,288 L784,294 L790,296 L790,284 Z',
  MA: 'M870,186 L889,180 L898,184 L900,190 L894,197 L882,200 L871,199 L866,194 Z',
  MI: 'M614,194 L624,190 L640,188 L650,194 L656,206 L654,224 L646,238 L636,244 L628,240 L620,230 L614,218 Z M595,196 L607,190 L618,198 L618,218 L612,234 L604,240 L596,238 L590,228 L588,214 L590,202 Z',
  MN: 'M498,140 L538,140 L545,146 L550,168 L555,194 L558,218 L558,236 L537,242 L516,242 L502,236 L498,218 L496,190 L495,160 Z',
  MS: 'M612,371 L612,408 L607,437 L605,453 L598,458 L589,462 L578,456 L574,440 L574,412 L574,404 L574,375 L590,372 Z',
  MO: 'M540,310 L570,310 L586,316 L597,333 L597,346 L590,360 L580,366 L558,370 L540,371 L530,370 L509,370 L510,336 L510,310 Z',
  MT: 'M283,140 L354,140 L362,142 L365,160 L360,180 L347,180 L320,180 L290,180 L276,176 L275,160 Z',
  NE: 'M398,274 L435,274 L470,270 L489,272 L500,280 L505,296 L509,312 L509,332 L435,332 L434,308 L430,290 L416,282 Z',
  NV: 'M178,240 L193,240 L205,248 L216,274 L222,310 L216,336 L205,348 L198,346 L193,329 L183,306 L175,288 L172,262 Z',
  NH: 'M869,136 L874,124 L872,148 L878,156 L874,168 L866,172 L860,163 L858,148 L862,138 Z',
  NJ: 'M830,240 L836,236 L840,246 L840,262 L835,276 L828,284 L822,276 L820,262 L822,248 Z',
  NM: 'M264,376 L319,376 L319,440 L306,443 L272,446 L262,446 L256,434 L255,416 L258,394 Z',
  NY: 'M790,180 L810,170 L830,172 L845,180 L853,192 L852,205 L843,215 L830,220 L830,240 L822,248 L815,240 L806,230 L800,218 L794,202 L790,190 Z',
  NC: 'M732,355 L756,346 L778,340 L798,338 L808,340 L810,350 L800,360 L782,364 L758,370 L735,374 L718,374 L705,370 L700,366 L712,360 Z',
  ND: 'M409,140 L466,140 L472,142 L474,170 L470,180 L408,180 L404,166 L406,148 Z',
  OH: 'M680,264 L695,256 L710,260 L718,270 L720,288 L716,308 L706,322 L698,326 L685,330 L672,330 L660,324 L650,312 L644,296 L640,278 L636,264 L652,260 Z',
  OK: 'M383,366 L435,370 L460,370 L485,374 L508,370 L510,386 L486,392 L465,396 L437,398 L418,398 L400,394 L383,398 L380,386 Z',
  OR: 'M134,182 L168,178 L186,178 L200,188 L208,204 L208,230 L193,240 L178,240 L160,230 L148,218 L138,204 L133,192 Z',
  PA: 'M746,244 L790,238 L806,230 L815,240 L822,248 L820,262 L814,275 L802,280 L790,284 L774,284 L760,278 L748,268 Z',
  RI: 'M873,205 L880,200 L884,207 L880,215 L873,213 Z',
  SC: 'M700,366 L718,374 L735,374 L730,390 L720,404 L706,412 L694,414 L685,406 L680,396 L678,384 L682,374 Z',
  SD: 'M408,200 L470,200 L476,202 L480,220 L482,242 L480,256 L470,270 L435,274 L416,282 L405,274 L400,258 L400,232 L404,214 Z',
  TN: 'M621,369 L633,367 L650,362 L673,358 L688,352 L699,340 L710,342 L725,345 L732,355 L712,360 L700,366 L682,374 L665,371 L640,370 L630,372 L622,372 Z',
  TX: 'M383,398 L400,394 L418,398 L437,398 L465,396 L486,392 L510,386 L520,400 L525,416 L530,440 L530,465 L524,486 L512,500 L496,508 L478,510 L460,506 L440,498 L420,488 L404,474 L392,458 L384,440 L380,420 Z',
  UT: 'M254,276 L256,240 L258,274 L272,274 L286,274 L290,296 L286,326 L265,340 L254,340 L242,336 L232,320 L232,300 L240,284 Z',
  VT: 'M858,148 L860,163 L866,172 L862,180 L852,183 L845,180 L844,168 L848,156 Z',
  VA: 'M700,318 L732,310 L758,304 L774,300 L790,296 L796,310 L800,324 L798,338 L778,340 L756,346 L732,355 L725,345 L710,342 L699,340 L698,326 Z',
  WA: 'M147,108 L178,108 L192,110 L202,120 L208,138 L206,158 L200,174 L186,178 L168,178 L148,174 L138,162 L134,148 L136,130 Z',
  WV: 'M732,310 L740,298 L748,292 L756,290 L760,278 L748,268 L746,278 L738,290 L730,300 L720,308 L710,316 L706,322 L698,326 L699,340 L710,342 L725,345 L732,340 L736,324 Z',
  WI: 'M556,176 L570,170 L582,172 L592,180 L598,194 L600,212 L598,232 L590,246 L580,250 L575,240 L558,236 L555,218 L554,196 Z',
  WY: 'M290,200 L354,200 L360,200 L362,244 L358,268 L348,274 L319,274 L290,274 L286,248 L284,220 Z',
  DC: 'M793,292 L797,288 L800,292 L797,296 Z',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function USMap({
  stateData,
  onStateClick,
  colorScale,
  title,
  legend,
}: USMapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    stateCode: string
    name: string
    label?: string
  } | null>(null)

  const getFill = useCallback(
    (stateCode: string) => {
      const d = stateData[stateCode]
      if (!d) return 'var(--codex-hover)'
      if (d.color) return d.color
      if (colorScale) return colorScale(d.value)
      return 'var(--codex-hover)'
    },
    [stateData, colorScale],
  )

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGPathElement>, stateCode: string) => {
      const svg = (e.target as SVGPathElement).closest('svg')
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 10,
        stateCode,
        name: STATE_NAMES[stateCode] ?? stateCode,
        label: stateData[stateCode]?.label,
      })
    },
    [stateData],
  )

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  return (
    <div className="relative w-full">
      {title && (
        <h3 className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          {title}
        </h3>
      )}

      <svg
        viewBox="0 0 960 600"
        className="w-full h-auto"
        role="img"
        aria-label={title ?? 'Map of the United States'}
      >
        <g>
          {Object.entries(STATE_PATHS).map(([code, d]) => (
            <path
              key={code}
              d={d}
              fill={getFill(code)}
              stroke="var(--codex-border)"
              strokeWidth={1}
              className="cursor-pointer transition-[filter] duration-150 hover:brightness-125"
              onClick={() => onStateClick?.(code)}
              onMouseEnter={(e) => handleMouseEnter(e, code)}
              onMouseMove={(e) => handleMouseEnter(e, code)}
              onMouseLeave={handleMouseLeave}
              role="button"
              aria-label={STATE_NAMES[code]}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onStateClick?.(code)
                }
              }}
            />
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 rounded-md px-3 py-1.5 text-sm shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--codex-card)',
            border: '1px solid var(--codex-border)',
            color: 'var(--codex-text)',
          }}
        >
          <span className="font-semibold">{tooltip.name}</span>
          {tooltip.label && (
            <span className="ml-2 text-[var(--codex-sub)]">
              {tooltip.label}
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      {legend && legend.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--codex-sub)]">
          {legend.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: color }}
              />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { STATE_NAMES }
