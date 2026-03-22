'use client'

interface AlignmentBarProps {
  score: number // 0-100
  size?: 'sm' | 'md'
}

function barColor(score: number): string {
  if (score > 70) return '#22C55E'
  if (score >= 40) return '#EAB308'
  return '#EF4444'
}

export function AlignmentBar({ score, size = 'md' }: AlignmentBarProps) {
  const height = size === 'sm' ? 4 : 6
  const color = barColor(score)

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 overflow-hidden rounded-full"
        style={{
          height,
          backgroundColor: 'var(--codex-border)',
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(score, 2)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span
        className="flex-shrink-0 text-xs font-semibold tabular-nums"
        style={{ color, minWidth: '2.5rem', textAlign: 'right' }}
      >
        {score}%
      </span>
    </div>
  )
}
