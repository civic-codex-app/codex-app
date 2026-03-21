'use client'

import { partyColor } from '@/lib/constants/parties'

interface IconProps {
  size?: number
  color?: string
  className?: string
}

export function DonkeyIcon({ size = 16, color = '#2563EB', className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 512"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path
        opacity=".4"
        fill={color}
        d="M192 320l352 0 0 160c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-64-160 0 0 64c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-160z"
      />
      <path
        fill={color}
        d="M64 32c0-8.9 3.8-20.9 6.2-27.3 1-2.8 3.8-4.7 6.8-4.7 1.9 0 3.8.7 5.2 2.1L128 45.7 173.8 2.1c1.4-1.3 3.2-2.1 5.2-2.1 3 0 5.8 1.8 6.8 4.7 2.4 6.5 6.2 18.4 6.2 27.3 0 26.5-21.9 42-29.5 46.6l76.2 72.6c6 5.7 13.9 8.8 22.1 8.8l219.2 0 32 0c40.3 0 78.2 19 102.4 51.2l19.2 25.6c10.6 14.1 7.7 34.2-6.4 44.8s-34.2 7.7-44.8-6.4l-19.2-25.6c-5.3-7-11.8-12.8-19.2-17l0 87.4-352 0-40.4-94.3c-3.9-9.2-15.3-12.6-23.6-7l-42.1 28c-9.1 6.1-19.7 9.3-30.7 9.3l-2 0C23.9 256 0 232.1 0 202.7 0 190.6 4.1 178.9 11.7 169.4L87.6 74.6C78.1 67.4 64 53.2 64 32zM256 280a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm248-24a24 24 0 1 0-48 0 24 24 0 1 0 48 0zM368 280a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"
      />
    </svg>
  )
}

export function ElephantIcon({ size = 16, color = '#DC2626', className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 512"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path
        opacity=".4"
        fill={color}
        d="M0 288L0 448c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-64 192 0 0 64c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-96 32 0 0 48c0 44.2 35.8 80 80 80s80-35.8 80-80l0-48c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-112-544 0z"
      />
      <path
        fill={color}
        d="M160 32C71.6 32 0 103.6 0 192l0 96 544 0 0-96c0-88.4-71.6-160-160-160L160 32zM128 136a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm232 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM256 136a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
      />
    </svg>
  )
}

export function GreenDiamond({ size = 16, color = '#16A34A', className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0 }}
    >
      <rect x="4" y="4" width="12" height="12" rx="2" fill={color} transform="rotate(45 10 10)" />
    </svg>
  )
}

export function StarIcon({ size = 16, color = '#7C3AED', className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path
        opacity=".4"
        fill={color}
        d="M256 0c10.5 0 19.7 6.8 22.9 16.7L329.6 176 488 176c10.3 0 19.4 6.5 22.7 16.2s.1 20.4-8 26.7L371.9 320.7 422.9 480.7c3.2 10-.5 21-9.1 27s-20.2 5.7-28.5-.7L256 406.4 256 0z"
      />
      <path
        fill={color}
        d="M256 0c-10.5 0-19.7 6.8-22.9 16.7L182.5 176 24 176c-10.3 0-19.4 6.5-22.7 16.2s-.1 20.4 8 26.7L140.1 320.7 89.1 480.7c-3.2 10 .5 21 9.1 27s20.2 5.7 28.5-.7L256 406.4 256 0z"
      />
    </svg>
  )
}

export function PartyIcon({ party, size = 16 }: { party: string; size?: number }) {
  const color = partyColor(party)
  const key = party.toLowerCase()
  if (key === 'democrat') return <DonkeyIcon size={size} color={color} />
  if (key === 'republican') return <ElephantIcon size={size} color={color} />
  if (key === 'green') return <GreenDiamond size={size} color={color} />
  return <StarIcon size={size} color={color} />
}
