'use client'

/**
 * Animated blob avatar showing stance distribution.
 * Blue blobs = supports, red blobs = opposes, gray blobs = neutral/mixed.
 * Blobs rotate slowly and are heavily blurred on a white background.
 */
export function StanceAvatar({
  supports,
  opposes,
  neutral,
  total,
  size = 40,
}: {
  supports: number
  opposes: number
  neutral: number
  total: number
  size?: number
}) {
  if (total === 0) {
    return (
      <div
        className="shrink-0 rounded-full bg-[var(--codex-border)]"
        style={{ width: size, height: size }}
      />
    )
  }

  const sPct = supports / total
  const oPct = opposes / total
  const nPct = neutral / total

  // Scale blob sizes based on percentages (min 20%, max 70%)
  const sSize = 20 + sPct * 50
  const oSize = 20 + oPct * 50
  const nSize = 20 + nPct * 50

  // Unique animation offset based on percentages (pseudo-random per voter)
  const offset = Math.round(sPct * 360)

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-[var(--codex-border)]"
      style={{ width: size, height: size, background: '#fff' }}
    >
      {/* Blue blob (supports) */}
      {supports > 0 && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${sSize}%`,
            height: `${sSize}%`,
            background: `rgba(59, 130, 246, ${0.4 + sPct * 0.5})`,
            filter: `blur(${size * 0.15}px)`,
            top: '15%',
            left: '10%',
            animation: `stance-blob-rotate ${8 + sPct * 4}s linear infinite`,
            transformOrigin: '60% 60%',
            animationDelay: `${-offset * 0.01}s`,
          }}
        />
      )}

      {/* Red blob (opposes) */}
      {opposes > 0 && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${oSize}%`,
            height: `${oSize}%`,
            background: `rgba(239, 68, 68, ${0.4 + oPct * 0.5})`,
            filter: `blur(${size * 0.15}px)`,
            bottom: '15%',
            right: '10%',
            animation: `stance-blob-rotate ${9 + oPct * 4}s linear infinite reverse`,
            transformOrigin: '40% 40%',
            animationDelay: `${-offset * 0.02}s`,
          }}
        />
      )}

      {/* Gray blob (neutral/mixed) */}
      {neutral > 0 && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${nSize}%`,
            height: `${nSize}%`,
            background: `rgba(107, 114, 128, ${0.3 + nPct * 0.4})`,
            filter: `blur(${size * 0.12}px)`,
            top: '40%',
            left: '35%',
            animation: `stance-blob-rotate ${10 + nPct * 3}s linear infinite`,
            transformOrigin: '50% 50%',
            animationDelay: `${-offset * 0.015}s`,
          }}
        />
      )}

      {/* CSS keyframes injected via style tag */}
      <style>{`
        @keyframes stance-blob-rotate {
          0% { transform: rotate(0deg) translate(10%, 5%); }
          25% { transform: rotate(90deg) translate(-5%, 10%); }
          50% { transform: rotate(180deg) translate(-10%, -5%); }
          75% { transform: rotate(270deg) translate(5%, -10%); }
          100% { transform: rotate(360deg) translate(10%, 5%); }
        }
      `}</style>
    </div>
  )
}
