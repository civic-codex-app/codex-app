'use client'

import { useState, type ReactNode } from 'react'

interface ShowMoreListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  initialCount?: number
  increment?: number
  className?: string
  keyExtractor?: (item: T, index: number) => string
}

export function ShowMoreList<T>({
  items,
  renderItem,
  initialCount = 6,
  increment = 6,
  className,
  keyExtractor,
}: ShowMoreListProps<T>) {
  const [visible, setVisible] = useState(initialCount)
  const total = items.length
  const showing = Math.min(visible, total)
  const hasMore = showing < total
  const remaining = total - showing

  if (total === 0) return null

  return (
    <div>
      <div className={className}>
        {items.slice(0, showing).map((item, i) => (
          <div key={keyExtractor ? keyExtractor(item, i) : i}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setVisible((v) => v + increment)}
          className="mt-3 w-full rounded-lg border border-[var(--codex-border)] py-2.5 text-[13px] font-medium text-[var(--codex-sub)] transition-all hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
        >
          Show {Math.min(remaining, increment)} more of {total}
        </button>
      )}
    </div>
  )
}
