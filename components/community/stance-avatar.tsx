/**
 * Animated blob avatar showing stance distribution.
 * Blue blobs = supports, red blobs = opposes, gray blobs = neutral/mixed.
 * Each avatar is unique based on the seed (derived from anonymous ID).
 */
export function StanceAvatar({
  supports,
  opposes,
  neutral,
  total,
  size = 40,
  seed = '',
}: {
  supports: number
  opposes: number
  neutral: number
  total: number
  size?: number
  seed?: string
}) {
  if (total === 0) {
    return (
      <div
        className="shrink-0 rounded-full bg-[var(--codex-border)]"
        style={{ width: size, height: size }}
      />
    )
  }

  // Simple hash from seed string to get deterministic pseudo-random values
  const h = hashSeed(seed || `${supports}-${opposes}-${neutral}`)

  const sPct = supports / total
  const oPct = opposes / total
  const nPct = neutral / total

  // Blob sizes scaled by percentage (min 25%, max 75%)
  const sSize = 25 + sPct * 50
  const oSize = 25 + oPct * 50
  const nSize = 25 + nPct * 50

  // Per-blob randomized positions (5%–35% range)
  const sTop = 5 + (h[0] % 30)
  const sLeft = 5 + (h[1] % 30)
  const oBottom = 5 + (h[2] % 30)
  const oRight = 5 + (h[3] % 30)
  const nTop = 20 + (h[4] % 30)
  const nLeft = 15 + (h[5] % 30)

  // Per-blob randomized speeds (6–14s range)
  const sSpeed = 6 + (h[6] % 8) + sPct * 2
  const oSpeed = 6 + (h[7] % 8) + oPct * 2
  const nSpeed = 7 + (h[8] % 7) + nPct * 2

  // Per-blob randomized origins
  const sOriginX = 30 + (h[9] % 40)
  const sOriginY = 30 + (h[10] % 40)
  const oOriginX = 30 + (h[11] % 40)
  const oOriginY = 30 + (h[12] % 40)

  // Per-blob randomized delays (negative for immediate offset)
  const sDelay = -(h[0] * 0.1)
  const oDelay = -(h[3] * 0.15)
  const nDelay = -(h[5] * 0.12)

  // Randomized direction
  const sReverse = h[13] % 2 === 0 ? 'reverse' : 'normal'
  const oReverse = h[14] % 2 === 0 ? 'reverse' : 'normal'
  const nReverse = h[15] % 2 === 0 ? 'reverse' : 'normal'

  // Reduce blur on small sizes (mobile perf) — use CSS will-change for GPU compositing
  const isMobile = size <= 48
  const blur = isMobile ? size * 0.08 : size * 0.15

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-[var(--codex-border)]"
      style={{ width: size, height: size, background: '#fff' }}
    >
      {supports > 0 && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${sSize}%`,
            height: `${sSize}%`,
            background: `rgba(59, 130, 246, ${0.4 + sPct * 0.5})`,
            filter: `blur(${blur}px)`,
            top: `${sTop}%`,
            left: `${sLeft}%`,
            animation: `stance-blob-rotate ${sSpeed}s linear infinite ${sReverse}`,
            transformOrigin: `${sOriginX}% ${sOriginY}%`,
            animationDelay: `${sDelay}s`,
            willChange: 'transform',
          }}
        />
      )}

      {opposes > 0 && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${oSize}%`,
            height: `${oSize}%`,
            background: `rgba(239, 68, 68, ${0.4 + oPct * 0.5})`,
            filter: `blur(${blur}px)`,
            bottom: `${oBottom}%`,
            right: `${oRight}%`,
            animation: `stance-blob-rotate ${oSpeed}s linear infinite ${oReverse}`,
            transformOrigin: `${oOriginX}% ${oOriginY}%`,
            animationDelay: `${oDelay}s`,
            willChange: 'transform',
          }}
        />
      )}

      {neutral > 0 && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${nSize}%`,
            height: `${nSize}%`,
            background: `rgba(107, 114, 128, ${0.3 + nPct * 0.4})`,
            filter: `blur(${blur * 0.8}px)`,
            top: `${nTop}%`,
            left: `${nLeft}%`,
            animation: `stance-blob-rotate ${nSpeed}s linear infinite ${nReverse}`,
            transformOrigin: '50% 50%',
            animationDelay: `${nDelay}s`,
            willChange: 'transform',
          }}
        />
      )}
    </div>
  )
}

/** Simple deterministic hash from a string → array of numbers 0-99 */
function hashSeed(str: string): number[] {
  const result: number[] = []
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  for (let i = 0; i < 20; i++) {
    h = ((h * 16807) + 1) | 0
    result.push(Math.abs(h) % 100)
  }
  return result
}
