'use client'

import { useState } from 'react'
import { PartyIcon } from '@/components/icons/party-icons'

interface AvatarImageProps {
  src: string | null | undefined
  alt: string
  size: number
  fallbackColor?: string
  party?: string
  className?: string
}

export function AvatarImage({ src, alt, size, fallbackColor, party, className }: AvatarImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: `${fallbackColor ?? '#666'}08` }}
      >
        {party ? (
          <PartyIcon party={party} size={Math.max(12, Math.round(size * 0.35))} />
        ) : (
          <span
            className="font-medium opacity-30"
            style={{ fontSize: Math.max(9, Math.round(size * 0.35)), color: fallbackColor ?? 'var(--codex-faint)' }}
          >
            {alt.charAt(0)}
          </span>
        )}
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
