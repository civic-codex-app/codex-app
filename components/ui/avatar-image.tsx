'use client'

import { useState } from 'react'

interface AvatarImageProps {
  src: string | null | undefined
  alt: string
  size: number
  className?: string
  /** Accepted for the call sites that still pass them; the fallback no longer
   *  colours itself by party. The party is the ring the caller draws. */
  fallbackColor?: string
  party?: string
}

/** "Debbie Dingell" → "DD"; a single word gives one letter. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  return (first + last).toUpperCase()
}

/**
 * A photo, or initials when there is none or the URL is dead. The fallback is
 * ink on the card colour in both themes: a face that is missing never becomes
 * a coloured block, and the party stays where it always is, in the ring.
 */
export function AvatarImage({ src, alt, size, className }: AvatarImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full items-center justify-center bg-[var(--poli-card)] font-semibold text-[var(--poli-text)]"
        style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}
      >
        {initials(alt)}
      </div>
    )
  }

  /* eslint-disable @next/next/no-img-element */
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
      className={className ?? 'h-full w-full object-cover'}
    />
  )
}
