'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AvatarImageProps {
  src: string
  alt: string
  size: number
  fallbackColor?: string
  className?: string
}

export function AvatarImage({ src, alt, size, fallbackColor, className }: AvatarImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className="flex h-full w-full items-center justify-center text-[9px] font-medium"
        style={{ color: fallbackColor ?? 'var(--codex-faint)', background: `${fallbackColor ?? '#666'}12` }}
      >
        {alt.charAt(0)}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      onError={() => setError(true)}
      className={className ?? 'h-full w-full object-cover'}
    />
  )
}
